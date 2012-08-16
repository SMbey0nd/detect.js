/**
 * @fileOverview 统一环境检测包[Detect] UA检测
 * @author SMbey0nd http://github.com/SMbey0nd
 * @version 0.1.0
 * MIT Licensed.
 */
// --------------------------------
// Thanks to:
//  - boomerang http://lognormal.github.com/boomerang/doc/howtos/index.html
//  - zepto detect module
//
// TODO: 
//  - 

(function(w) {

	DETECT = DETECT || {};
	DETECT.plugins = DETECT.plugins || {};

	var core = {
		rule: function(){
			var ua = navigator.userAgent;
			var D = DETECT.INFO.ua;
		    var webkit = ua.match(/WebKit\/([\d.]+)/),
				android = ua.match(/(Android)\s+([\d.]+)/),
				ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
				iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
				webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
				blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/);
				//TODO：还缺少WP、UC、QQ的UA等，待完成

			//浏览器信息
			if(webkit) D.browser.name = 'webkit', D.browser.version = webkit[1];

			//平台信息
			if(android) D.plat.name = 'android', D.plat.version = android[2];
			if(iphone) D.plat.name = 'ios', D.plat.version = iphone[2].replace(/_/g, '.'), D.device.name = 'iphone';
			if(ipad) D.plat.name = 'ios', D.plat.version = ipad[2].replace(/_/g, '.'), D.device.name = 'ipad';
			if(webos) D.plat.name = 'webos', D.plat.version = webos[2];
			//TODO：缺少device版本，如4S等，待完成
		}

	};

	DETECT.plugins.UA = {
		init: function(config){
			DETECT.utils.pluginConfig(core, config, "UA");
			core.rule();
		}
	}

}(window));