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
		utils: {

			getCookie: function(name) {
				if(!name) {
					return null;
				}

				name = ' ' + name + '=';

				var i, cookies;
				cookies = ' ' + d.cookie + ';';
				if ( (i=cookies.indexOf(name)) >= 0 ) {
					i += name.length;
					cookies = cookies.substring(i, cookies.indexOf(';', i));
					return cookies;
				}

				return null;
			},

			setCookie: function(name, subcookies, max_age) {
				var value=[], k, nameval, c, exp;

				if(!name) {
					return false;
				}

				for(k in subcookies) {
					if(subcookies.hasOwnProperty(k)) {
						value.push(encodeURIComponent(k) + '=' + encodeURIComponent(subcookies[k]));
					}
				}

				value = value.join('&');

				nameval = name + '=' + value;

				c = [nameval, "path=/", "domain=" + impl.site_domain];
				if(max_age) {
					exp = new Date();
					exp.setTime(exp.getTime() + max_age*1000);
					exp = exp.toGMTString();
					c.push("expires=" + exp);
				}

				if ( nameval.length < 4000 ) {
					d.cookie = c.join('; ');
					// confirm cookie was set (could be blocked by user's settings, etc.)
					return ( value === this.getCookie(name) );
				}

				return false;
			},

			removeCookie: function(name) {
				return this.setCookie(name, {}, 0);
			}

		},

		init: function(){
			
		}
	};

	for(key in detect) {
		if(detect.hasOwnProperty(key)) {
			DETECT[key] = detect[key];
		}
	}

	DETECT.plugins = DETECT.plugins || {};

}(window));