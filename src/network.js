/**
 * @fileOverview 统一环境检测包[Detect] Network网络环境嗅探
 * @author SMbey0nd http://github.com/SMbey0nd
 * @version 0.1
 * MIT Licensed.
 */
// --------------------------------
// Thanks to:
//  - boomerang http://lognormal.github.com/boomerang/doc/howtos/index.html
//
// TODO: 
//  - 

(function(w) {

	DETECT = DETECT || {};
	DETECT.plugins = DETECT.plugins || {};

	var images = [
		{ name: "image-0.png", size: 11483, timeout: 1400 },
		{ name: "image-1.png", size: 40658, timeout: 1200 },
		{ name: "image-2.png", size: 164897, timeout: 1300 },
		{ name: "image-3.png", size: 381756, timeout: 1500 },
		{ name: "image-4.png", size: 1234664, timeout: 1200 },
		{ name: "image-5.png", size: 4509613, timeout: 1200 },
		{ name: "image-6.png", size: 9084559, timeout: 1200 }
	];
	images.end = images.length;
	images.start = 0;

	var core = {
		//属性
		base_url: '../src/images/', //http://a.tbcdn.cn/xxx
		timeout: 15000, //15000

		//状态
		results: [],
		running: false,
		aborted: false,
		complete: false,
		runs_left: 0,

		//方法
		img_loaded: function(i, tstart, run, success){

			var result = {
					start: tstart,
					end: new Date().getTime(),
					t: null,
					state: success,
					run: run
				};
			if(success) {
				result.t = result.end-result.start;
			}
			this.results[this.nruns-run].r[i] = result;

			// we terminate if an image timed out because that means the connection is
			// too slow to go to the next image
			if(i >= images.end-1
				|| typeof this.results[this.nruns-run].r[i+1] !== "undefined"
			) {

				if(run === this.nruns) {
					images.start = i;
				}
				this.defer(this.iterate);
			} else {
				this.load_img(i+1, run, this.img_loaded);
			}
		},
		finish: function(){
			//计算bw
			var	bw = this.calculate();
			var grade = this.grade(bw);

			//setcookies
			//写入INFO
			DETECT.INFO.network.brandwidth = bw;
			DETECT.INFO.network.type = 'wifi';
			DETECT.INFO.network.grade = grade;
			document.write('DETECT.INFO：<br/>'+JSON.stringify(DETECT.INFO));

			this.complete = true;
			this.running = false;
		},
		calculate: function(){
			//计算
			var result = -1,
				nimgs=0,
				bw,
				sum=0,
				bandwidths=[],
				r=this.results[0].r;
			for(i=r.length-1; i>=0 && nimgs<3; i--) {
				if(!r[i]) {
					break;
				}
				if(r[i].t === null) {
					continue;
				}
				nimgs++;
				bw = images[i].size*1000/r[i].t; // 字节/秒
				bandwidths.push(bw);
			}
			
			var n = bandwidths.length;
			for(j=0; j<n; j++){
				sum += bandwidths[j];
				//alert(bandwidths[j]);
			}
			result = Math.round(sum/n);
			console.log('3次平均网速：'+ result +'字节/秒，相当于' + result*8/1000 + 'Kbps');
			return result;
		},
		grade: function(bw){
			//网速：
			//低速（2G）：
			//中速（WIFI/3G）：
			//高速（WIFI/3G）：
			var bps = bw*8;
			if(bps>0 && bps<768000){
				return 'slow';
			}else if(bps>=768000 && bps<1500000){
				return 'medium';
			}else if(bps>=1500000){
				return 'fast';
			}
		},
		defer: function(func){
			var that = this;
			return setTimeout(function(){func.call(that); that=null;}, 10);
		},
		load_img: function(i, run, callback){
			var url = this.base_url + images[i].name
				+ '?t=' + (new Date().getTime()) + Math.random(),	// Math.random() is slow, but we get it before we start the timer
			    timer = 0, tstart = 0,
			    img = new Image(),
			    that = this;

			img.onload = img.onerror = function() {
				img.onload = img.onerror = null;
				img = null;
				clearTimeout(timer);
				if(callback) {
					callback.call(that, i, tstart, run, true);
				}
				that = callback = null;
			};

			timer = setTimeout(function() {
						if(callback) {
							callback.call(that, i, tstart, run, null);
						}
					},
					images[i].timeout
					//	+ Math.min(400, this.latency ? this.latency.mean : 400)
				);

			tstart = new Date().getTime();
			img.src = url;

		},
		iterate: function(){
			if(this.aborted) {
				return false;
			}

			if(!this.runs_left) {
				this.finish();
			}
			/*
			else if(this.latency_runs) {
				this.load_img('l', this.latency_runs--, this.lat_loaded);
			}
			*/
			else {
				this.results.push({r:[]});
				this.load_img(images.start, this.runs_left--, this.img_loaded);
			}
		}
	};

	DETECT.plugins.network = {
		init: function(config){
			DETECT.utils.pluginConfig(core, config, "network");
			core.runs_left = core.nruns = 5;

			//页面加载完成后
			this.run();

			return this;
		},
		run: function(){
			core.running = true;
			setTimeout(this.abort, core.timeout);
			core.defer(core.iterate);

			return this;
		},
		abort: function(){
			core.aborted = true;
			if(core.running) core.finish();
			return this;
		}
	};


}(window));