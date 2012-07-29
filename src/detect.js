/**
 * @fileOverview 统一环境检测包[Detect] Core 核心文件，在应用的最初始时加载，保持最简洁，无任何依赖
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

	var init, detect, key, d = w.document;

	if(typeof DETECT === "undefined") {
		DETECT = {};
	}

	if(DETECT.version) {
		return;
	}

	DETECT.version = "0.1";

	init = {

	};

	detect = {

	};

	for(key in detect) {
		if(detect.hasOwnProperty(key)) {
			DETECT[key] = detect[key];
		}
	}

	DETECT.plugins = DETECT.plugins || {};

}(window));