/**
 * @fileOverview 统一环境检测包[Detect] Network网络环境嗅探
 * @author SMbey0nd http://github.com/SMbey0nd
 * @version 0.2
 * MIT Licensed.
 */
// --------------------------------
// Thanks to:
//  - boomerang http://lognormal.github.com/boomerang/doc/howtos/index.html
//
// TODO: 
//  - 优化图片设置
//  - 增加webtiming
//  - 增加延迟细节测量

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
		exptime: 86400000, //一天

		//状态
		results: [],
		running: false,
		aborted: false,
		complete: false,
		//runs_left: 1,

		//方法
		//图片加载后的后续处理，定义result集合，写入该图片load时间，超时处理等
		prefix: function(){
			var type = this.checktype();
			DETECT.INFO.network.type = type;

			//读取localstrage
			var info = this.getLocal('DETECT_INFO');

			//console.log(info);
			if(info && !this.exp()){ //本地已有数据并且没过期，记入DETECT并退出
				var bw = info.brandwidth,
					grade = info.grade;
				DETECT.INFO.network.brandwidth = parseInt(bw);
				DETECT.INFO.network.grade = grade;
				DETECT.utils.print();
				return;
			}
			//alert('进入');
			setTimeout(this.abort, core.timeout);
			core.defer(core.iterate); //延迟10ms执行iterate //iterate用来初始化result中的r 并执行load_img

		},
		exp:function(){ //1天=24*60*60*1000=86400000毫秒
			var now = new Date().getTime(), local = this.getLocal('DETECT_INFO').exptime;
			return now - local >= this.exptime;
		},
		getLocal: function(k){
			var k = localStorage.getItem(k);
			return JSON.parse(k);
		},
		setLocal: function(k,v){
			v = JSON.stringify(v);
			return localStorage.setItem(k,v);
		},
		img_loaded: function(i, tstart, success){ //参数：当前图片序号、开始时间、剩余次数-1(5)、true
		
			if(this.results[i])	{	//当前图片已测过 
				return;
			}

			// 如果超时，设置下一张图，终止
			if(success === null) { //当前超时
				this.results[i+1] = {t:null, state: null}; //设置下一张图
				return;
			}
			var result = {
					start: tstart,
					end: new Date().getTime(),
					t: null,
					state: success
				};
			// 如果成功则记录时间差
			if(success) {
				result.t = result.end - result.start; //如果失败，result.t则是null
			}

			//私有result写入this.results[0].r[0]
			this.results[i] = result;

			// 图片加载超时（网速太慢），则跳到下一张
			if(i >= images.end-1 //当前图片序号是最后一张 或者
				|| typeof this.results[i+1] !== "undefined" //r[i+1]有值
			) {
				//第一次运行是一个试点来决定我们可以下载的最大图片是什么，然后后续run只下载图像就够了
				/*
				if(run === this.nruns) { //如果当前大轮训次数 === 大轮询总次数
					images.start = i; //images.start 为当前图片序号
					//alert(i);
				}
				*/
				//this.defer(this.iterate); //延迟10ms执行iterate //iterate用来初始化result中的r 并执行load_img
				this.finish();
			} else {
				this.load_img(i+1, this.img_loaded); //进入下一张图，执行load_img 参数：当前图片序号+1、剩余次数-1(5)、img_loaded回调
			}
		},
		finish: function(){
			//计算bw
			var bw = this.calculate();
			var grade = this.grade(bw);

			//setcookies
			//写入INFO
			DETECT.INFO.network.brandwidth = bw;
			DETECT.INFO.network.grade = grade;
			//document.body.innerHTML = ('DETECT.INFO：<br/>'+JSON.stringify(DETECT.INFO));
			DETECT.utils.print();

			//写入localstorage
			/*
			localStorage.setItem('DETECT_INFO_NETWORK', true);
			localStorage.setItem('DETECT_INFO_NETWORK_BRANDWIDTH', bw);
			localStorage.setItem('DETECT_INFO_NETWORK_GRADE', grade);
			*/
			var exptime = new Date().getTime();
			//console.log(o);
			this.setLocal('DETECT_INFO', {network:true,brandwidth:bw,grade:grade,exptime:exptime});
			//console.log(JSON.parse(this.getLocal('DETECT_INFO')));

			this.complete = true;
			this.running = false;
		},
		checktype: function(){
			//var isOnline = navigator.onLine;
			var connection = navigator.connection;
			if(connection){
				//var onlinetxt = isOnline?'在线':'不在线';
				var type = '';
				switch(connection.type){
					case connection.UNKNOWN:
						type = 'UNKNOWN';
						break;
					case connection.ETHERNET:
						//type = navigator.connection.ETHERNET + 'ETHERNET';
						type = 'ETHERNET';
						break;
					case connection.WIFI:
						//type = navigator.connection.WIFI + 'WIFI';
						type = 'WIFI';
						break;
					case connection.CELL_2G:
						//type = navigator.connection.CELL_2G + '2G';
						type = '2G';
						break;
					case connection.CELL_3G:
						//type = navigator.connection.CELL_3G + '3G';
						type = '3G';
						break;
				}
				return type;

			}else{
				return false;
			}
		},
		calculate: function(){
			//计算
			var result = -1,
				nimgs=0,
				bw,
				sum=0,
				bandwidths=[],
				r=this.results;
			for(i=r.length-1; i>=0; i--) {
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
			console.log(nimgs+'次平均网速：'+ result +'字节/秒，相当于' + result*8/1000 + 'Kbps');
			return result;
		},
		grade: function(bw){
			//网速：
			//低速（2G）：768000-
			//中速（WIFI/3G）：768000-1500000
			//高速（WIFI/3G）：1500000+
			var bps = bw*8;
			if(bps>0 && bps<768000){
				return 'slow';
			}else if(bps>=768000 && bps<1500000){
				return 'medium';
			}else if(bps>=1500000){
				return 'fast';
			}
		},

		//延迟10ms
		defer: function(func){
			var that = this;
			return setTimeout(function(){func.call(that); that=null;}, 10);
		},
		load_img: function(i, callback){ //参数：当前图片序号、剩余次数-1(5)、img_loaded回调
			var url = this.base_url + images[i].name
				+ '?t=' + (new Date().getTime()) + Math.random(), // Math.random() is slow, but we get it before we start the timer
				timer = 0, tstart = 0,
				img = new Image(),
				that = this;

			//img的onload和定时器同时触发，如果onload在timeout时间内完毕，则清楚定时器，进入正常流
			//如果超出timeout还没onload，则直接调用callback，成功参数传入null
			img.onload = function() {
				img.onload=img.onerror=null;
				img=null;
				clearTimeout(timer); //清除定时器
				if(callback) {
					callback.call(that, i, tstart, true); //回调img_loaded 参数：this、当前图片序号、开始时间、剩余次数-1(5)、成功
				}
				that=callback=null;
			};
			img.onerror = function() {
				img.onload=img.onerror=null;
				img=null;
				clearTimeout(timer);
				if(callback) {
					callback.call(that, i, tstart, false);
				}
				that=callback=null;
			};

			timer = setTimeout(function() { //在当前images设定的timeout时间后，再执行一个img_loaded回调
						if(callback) {
							callback.call(that, i, tstart, null);
						}
					},
					images[i].timeout
					//	+ Math.min(400, this.latency ? this.latency.mean : 400)
				);

			tstart = new Date().getTime();
			img.src = url;

		},

		iterate: function(finish){
			if(this.aborted) {
				return false;
			}

			if(finish) { //如果runs_left为0 就结束
				this.finish();
			}
			/*
			else if(this.latency_runs) {
				this.load_img('l', this.latency_runs--, this.lat_loaded);
			}
			*/
			else {
				//this.results.push({}); //初始化一个新的r
				this.load_img(images.start, this.img_loaded); //参数：当前图片序号、大轮训次数-1去掉、img_loaded回调
			}
		}
	};

	DETECT.plugins.network = {
		init: function(config){
			DETECT.utils.pluginConfig(core, config, "network");
			//core.runs_left = 1;

			//页面加载完成后
			this.run();

			return this;
		},
		run: function(){
			core.running = true;
			core.prefix();

			return this;
		},
		abort: function(){
			core.aborted = true;
			if(core.running) core.finish();
			return this;
		}
	};


}(window));