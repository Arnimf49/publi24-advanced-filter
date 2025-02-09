(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['ad_template'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    .ww-buttons {\n        overflow: hidden;\n    }\n    .ww-buttons > * {\n        float: right;\n        margin-left: 5px;\n    }\n    .ww-message {\n        float: right;\n    }\n"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"IS_AD_PAGE") : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":21,"column":8},"end":{"line":25,"column":15}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    return "        .ww-results, .ww-buttons {\n            padding: 0 10px;\n        }\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "Ma-m razgândit";
},"6":function(container,depth0,helpers,partials,data) {
    return "Ascunde";
},"8":function(container,depth0,helpers,partials,data) {
    return "#696969";
},"10":function(container,depth0,helpers,partials,data) {
    return "#c59b2f";
},"12":function(container,depth0,helpers,partials,data) {
    return "Șterge din favorite";
},"14":function(container,depth0,helpers,partials,data) {
    return "Adaugă la favorite";
},"16":function(container,depth0,helpers,partials,data) {
    return "#b34c4c";
},"18":function(container,depth0,helpers,partials,data) {
    return "#e0dada";
},"20":function(container,depth0,helpers,partials,data) {
    return "#fefefe";
},"22":function(container,depth0,helpers,partials,data) {
    return "none";
},"24":function(container,depth0,helpers,partials,data) {
    return "#333";
},"26":function(container,depth0,helpers,partials,data) {
    return "display:none;";
},"28":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <a href='"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"nimfomaneLink") || (depth0 != null ? lookupProperty(depth0,"nimfomaneLink") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"nimfomaneLink","hash":{},"data":data,"loc":{"start":{"line":50,"column":17},"end":{"line":50,"column":34}}}) : helper)))
    + "' target='_blank' style='position: relative; display: inline-block;'>\n            <svg\n                    style='position: absolute;\n               width: 20px;\n               height: 20px;\n               margin-top: 2px;\n               margin-left: 2px;'\n                    xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\">\n                <polygon fill='#8fc38f' points=\"2.67 7.63 5.46 10.41 13.33 2.54 14.85 4.06 5.46 13.46 1.15 9.15 2.67 7.63\"/>\n            </svg>\n            <img style='background: #2f4979;\n                "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(29, data, 0),"inverse":container.program(31, data, 0),"data":data,"loc":{"start":{"line":61,"column":16},"end":{"line":61,"column":77}}})) != null ? stack1 : "")
    + "\n                    border-radius: 4px;\n                    padding: 12px;'\n                 src='https://nimfomane.com/forum/uploads/monthly_2024_01/logo2.png.d461ead015b3eddf20bc0a9b70668583.png'/>\n        </a>\n";
},"29":function(container,depth0,helpers,partials,data) {
    return "width:94px;";
},"31":function(container,depth0,helpers,partials,data) {
    return "height: 45px;";
},"33":function(container,depth0,helpers,partials,data) {
    return "    <p style=\"\" class=\"ww-message\">ai mai ascuns un anunț cu acceeași numar de telefon; ascuns automat</p>\n";
},"35":function(container,depth0,helpers,partials,data) {
    return "    <p style=\"color: rgb(34, 34, 34); font-size: .8125rem;\" class=\"ww-message\">anuntul nu are nr telefon;</p>\n";
},"37":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"phone") : depth0),{"name":"if","hash":{},"fn":container.program(38, data, 0, blockParams, depths),"inverse":container.program(83, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":77,"column":4},"end":{"line":199,"column":11}}})) != null ? stack1 : "");
},"38":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <div class=\"ww-results\">\n            <h4 style='font-weight: bold; padding-top: 10px;'>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(39, data, 0, blockParams, depths),"inverse":container.program(41, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":80,"column":16},"end":{"line":84,"column":23}}})) != null ? stack1 : "")
    + "                <a href=\"https://wa.me/+4"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"phone") || (depth0 != null ? lookupProperty(depth0,"phone") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"phone","hash":{},"data":data,"loc":{"start":{"line":85,"column":41},"end":{"line":85,"column":50}}}) : helper)))
    + "\" target=\"_blank\" style=\"margin-left: 5px\">\n                    <svg style=\"height: 26px; vertical-align: middle; margin-bottom: 4px;\" viewBox=\"235.36 400.69 325.29 325.29\" xmlns=\"http://www.w3.org/2000/svg\">\n                        <defs>\n                            <clipPath id=\"b\">\n                                <path d=\"M 0,841.89 H 595.276 V 0 H 0 Z\"/>\n                            </clipPath>\n                            <linearGradient id=\"a\" x2=\"1\" gradientTransform=\"matrix(-1.53e-5 -243.96 243.96 -1.53e-5 298.5 541.37)\" gradientUnits=\"userSpaceOnUse\">\n                                <stop stop-color=\"#61fd7d\" offset=\"0\"/>\n                                <stop stop-color=\"#2bb826\" offset=\"1\"/>\n                            </linearGradient>\n                        </defs>\n                        <g transform=\"matrix(1.3333 0 0 -1.3333 0 1122.5)\">\n                            <g clip-path=\"url(#b)\">\n                                <path d=\"m420.46 359.32c0-1.336-0.041-4.232-0.121-6.47-0.197-5.475-0.63-12.54-1.286-15.76-0.988-4.837-2.477-9.403-4.418-13.204-2.297-4.496-5.228-8.523-8.71-11.998-3.474-3.469-7.497-6.388-11.987-8.676-3.82-1.947-8.415-3.437-13.28-4.419-3.187-0.644-10.199-1.069-15.64-1.263-2.24-0.08-5.137-0.12-6.467-0.12l-120.13 0.019c-1.336 0-4.232 0.041-6.47 0.121-5.475 0.197-12.541 0.631-15.76 1.287-4.837 0.986-9.404 2.476-13.204 4.417-4.496 2.298-8.523 5.228-11.998 8.71-3.469 3.475-6.388 7.498-8.676 11.987-1.947 3.821-3.437 8.415-4.42 13.281-0.643 3.186-1.068 10.199-1.262 15.639-0.08 2.239-0.12 5.137-0.12 6.468l0.019 120.12c0 1.336 0.041 4.233 0.121 6.471 0.196 5.475 0.631 12.54 1.287 15.759 0.986 4.838 2.475 9.404 4.417 13.205 2.298 4.496 5.228 8.522 8.71 11.998 3.474 3.469 7.498 6.388 11.987 8.676 3.82 1.947 8.415 3.437 13.28 4.419 3.187 0.643 10.2 1.069 15.64 1.262 2.24 0.08 5.138 0.121 6.468 0.121l120.12-0.02c1.336 0 4.233-0.04 6.47-0.121 5.476-0.196 12.541-0.63 15.761-1.287 4.837-0.986 9.403-2.475 13.204-4.417 4.495-2.297 8.522-5.228 11.998-8.71 3.469-3.474 6.388-7.497 8.676-11.986 1.947-3.821 3.436-8.415 4.419-13.281 0.643-3.187 1.069-10.199 1.262-15.64 0.08-2.24 0.12-5.137 0.12-6.468z\" fill=\"url(#a)\"/>\n                                <path d=\"m341.14 403.54c-2.187 1.094-12.934 6.38-14.937 7.109-2.004 0.73-3.461 1.094-4.919-1.093-1.457-2.188-5.645-7.11-6.922-8.569-1.274-1.458-2.549-1.64-4.735-0.547-2.186 1.094-9.229 3.402-17.579 10.846-6.498 5.794-10.885 12.951-12.16 15.139s-0.135 3.37 0.959 4.46c0.983 0.978 2.185 2.552 3.279 3.828 1.092 1.276 1.457 2.188 2.186 3.646 0.728 1.458 0.364 2.735-0.183 3.828-0.546 1.094-4.918 11.85-6.74 16.225-1.774 4.261-3.576 3.685-4.918 3.752-1.274 0.063-2.732 0.077-4.189 0.077s-3.826-0.548-5.829-2.735c-2.004-2.188-7.651-7.475-7.651-18.23 0-10.756 7.833-21.147 8.926-22.605 1.093-1.459 15.414-23.531 37.341-32.996 5.215-2.252 9.288-3.597 12.462-4.604 5.237-1.663 10.001-1.428 13.768-0.866 4.2 0.628 12.933 5.287 14.755 10.392 1.821 5.104 1.821 9.479 1.275 10.39-0.547 0.911-2.004 1.458-4.189 2.553m-39.885-54.441h-0.029c-13.048 6e-3 -25.846 3.509-37.009 10.132l-2.656 1.576-27.52-7.217 7.346 26.823-1.73 2.75c-7.278 11.573-11.122 24.95-11.116 38.685 0.015 40.078 32.634 72.685 72.742 72.685 19.421-8e-3 37.678-7.579 51.407-21.318 13.728-13.739 21.285-32.003 21.277-51.425-0.016-40.082-32.635-72.691-72.712-72.691m61.884 134.56c-16.517 16.531-38.482 25.639-61.885 25.649-48.22 0-87.464-39.23-87.484-87.45-6e-3 -15.415 4.022-30.46 11.678-43.722l-12.411-45.319 46.376 12.161c12.778-6.967 27.164-10.639 41.806-10.645h0.036c3e-3 0-3e-3 0 0 0 48.215 0 87.464 39.235 87.483 87.455 9e-3 23.368-9.082 45.341-25.599 61.871\" fill=\"#fff\"/>\n                            </g>\n                        </g>\n                    </svg>\n                </a>\n            </h4>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"hasDuplicateAdsWithSamePhone") : depth0),{"name":"if","hash":{},"fn":container.program(43, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":105,"column":12},"end":{"line":107,"column":19}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"visible") : depth0),{"name":"if","hash":{},"fn":container.program(45, data, 0, blockParams, depths),"inverse":container.program(81, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":109,"column":12},"end":{"line":174,"column":19}}})) != null ? stack1 : "")
    + "        </div>\n";
},"39":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <a href=\"tel:"
    + alias4(((helper = (helper = lookupProperty(helpers,"phone") || (depth0 != null ? lookupProperty(depth0,"phone") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"phone","hash":{},"data":data,"loc":{"start":{"line":81,"column":33},"end":{"line":81,"column":42}}}) : helper)))
    + "\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"phone") || (depth0 != null ? lookupProperty(depth0,"phone") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"phone","hash":{},"data":data,"loc":{"start":{"line":81,"column":44},"end":{"line":81,"column":53}}}) : helper)))
    + "</a>\n";
},"41":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"phone") || (depth0 != null ? lookupProperty(depth0,"phone") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"phone","hash":{},"data":data,"loc":{"start":{"line":83,"column":20},"end":{"line":83,"column":29}}}) : helper)))
    + "\n";
},"43":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <p style=\"color: #9d9103; font-size: .8125rem;\"><strong>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"numberOfAdsWithSamePhone") || (depth0 != null ? lookupProperty(depth0,"numberOfAdsWithSamePhone") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"numberOfAdsWithSamePhone","hash":{},"data":data,"loc":{"start":{"line":106,"column":72},"end":{"line":106,"column":100}}}) : helper)))
    + "</strong> anunțuri cu acest telefon <a data-wwid=\"duplicates\">(vizualizează)</a></p>\n";
},"45":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <h5 style=\"margin-top: 5px; margin-bottom: 3px; font-size: 1.125rem\">\n                    Rezultate după telefon\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"phoneInvestigatedSinceDays") : depth0),{"name":"if","hash":{},"fn":container.program(46, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":112,"column":20},"end":{"line":116,"column":27}}})) != null ? stack1 : "")
    + "                </h5>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(lookupProperty(helpers,"isUndefined")||(depth0 && lookupProperty(depth0,"isUndefined"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"searchLinks") : depth0),{"name":"isUndefined","hash":{},"data":data,"loc":{"start":{"line":118,"column":22},"end":{"line":118,"column":47}}}),{"name":"if","hash":{},"fn":container.program(51, data, 0, blockParams, depths),"inverse":container.program(53, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":118,"column":16},"end":{"line":129,"column":23}}})) != null ? stack1 : "")
    + "\n                <h5 style=\"margin-top: 5px; margin-bottom: 3px; font-size: 1.125rem\">\n                    Rezultate după imagine\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"imageInvestigatedSinceDays") : depth0),{"name":"if","hash":{},"fn":container.program(59, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":133,"column":20},"end":{"line":137,"column":27}}})) != null ? stack1 : "")
    + "                </h5>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(lookupProperty(helpers,"isUndefined")||(depth0 && lookupProperty(depth0,"isUndefined"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"imageSearchDomains") : depth0),{"name":"isUndefined","hash":{},"data":data,"loc":{"start":{"line":139,"column":22},"end":{"line":139,"column":54}}}),{"name":"if","hash":{},"fn":container.program(51, data, 0, blockParams, depths),"inverse":container.program(61, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":139,"column":16},"end":{"line":171,"column":23}}})) != null ? stack1 : "");
},"46":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                        <span style=\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"phoneInvestigateStale") : depth0),{"name":"if","hash":{},"fn":container.program(47, data, 0),"inverse":container.program(49, data, 0),"data":data,"loc":{"start":{"line":113,"column":37},"end":{"line":113,"column":111}}})) != null ? stack1 : "")
    + "font-size: 0.825rem;\">\n                            ("
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"phoneInvestigatedSinceDays") || (depth0 != null ? lookupProperty(depth0,"phoneInvestigatedSinceDays") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"phoneInvestigatedSinceDays","hash":{},"data":data,"loc":{"start":{"line":114,"column":29},"end":{"line":114,"column":59}}}) : helper)))
    + ")\n                        </span>\n";
},"47":function(container,depth0,helpers,partials,data) {
    return "color: #8b5454;";
},"49":function(container,depth0,helpers,partials,data) {
    return "color: #69875c;";
},"51":function(container,depth0,helpers,partials,data) {
    return "                    <p style=\"color: #8b5454; font-size: .8125rem;\">nerulat</p>\n";
},"53":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"filteredSearchLinks") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),{"name":"unless","hash":{},"fn":container.program(54, data, 0),"inverse":container.program(56, data, 0),"data":data,"loc":{"start":{"line":121,"column":20},"end":{"line":128,"column":31}}})) != null ? stack1 : "");
},"54":function(container,depth0,helpers,partials,data) {
    return "                        <p style=\"color: #69875c; font-size: .8125rem;\">nu au fost găsite linkuri relevante</p>\n";
},"56":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"filteredSearchLinks") : depth0),{"name":"each","hash":{},"fn":container.program(57, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":124,"column":24},"end":{"line":127,"column":33}}})) != null ? stack1 : "");
},"57":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "                            <div style=\"font-size: .8125rem; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;\">\n                                <a onclick='event.stopPropagation()' href=\""
    + alias2(alias1(depth0, depth0))
    + "\" target=\"_blank\">"
    + alias2(alias1(depth0, depth0))
    + "</a></div>\n";
},"59":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                        <span style=\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"imageInvestigateStale") : depth0),{"name":"if","hash":{},"fn":container.program(47, data, 0),"inverse":container.program(49, data, 0),"data":data,"loc":{"start":{"line":134,"column":37},"end":{"line":134,"column":111}}})) != null ? stack1 : "")
    + "font-size: 0.825rem;\">\n                            ("
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"imageInvestigatedSinceDays") || (depth0 != null ? lookupProperty(depth0,"imageInvestigatedSinceDays") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"imageInvestigatedSinceDays","hash":{},"data":data,"loc":{"start":{"line":135,"column":29},"end":{"line":135,"column":59}}}) : helper)))
    + ")\n                        </span>\n";
},"61":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"imageSearchDomains") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),{"name":"unless","hash":{},"fn":container.program(54, data, 0, blockParams, depths),"inverse":container.program(62, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":142,"column":20},"end":{"line":170,"column":31}}})) != null ? stack1 : "");
},"62":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"hasImagesInOtherLocation") : depth0),{"name":"if","hash":{},"fn":container.program(63, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":145,"column":24},"end":{"line":147,"column":31}}})) != null ? stack1 : "")
    + "                        <div style=\"font-size: .8125rem;\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"imageSearchDomains") : depth0),{"name":"each","hash":{},"fn":container.program(65, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":149,"column":28},"end":{"line":168,"column":37}}})) != null ? stack1 : "")
    + "                        </div>\n";
},"63":function(container,depth0,helpers,partials,data) {
    return "                            <p style=\"color: #8b5454; font-size: .8125rem; margin-bottom: 5px;\">anunțuri active găsite in alte locații !</p>\n";
},"65":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"links") : depth0),{"name":"each","hash":{},"fn":container.program(66, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":150,"column":32},"end":{"line":167,"column":41}}})) != null ? stack1 : "");
},"66":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                    <a href=\""
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"link") : depth0), depth0))
    + "\" target=\"_blank\"\n                                       style=\"display: inline-block;\n                                               background-color: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isDead") : depth0),{"name":"if","hash":{},"fn":container.program(67, data, 0, blockParams, depths),"inverse":container.program(69, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":153,"column":65},"end":{"line":153,"column":201}}})) != null ? stack1 : "")
    + ";\n                                               padding: 5px;\n                                               margin-right: 3px;\n                                               margin-bottom: 6px;\n                                               border-radius: 5px;\n                                               text-decoration: none;\n                                               color: rgb(55 55 55);\n                                   \">\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(data && lookupProperty(data,"first")),{"name":"if","hash":{},"fn":container.program(77, data, 0, blockParams, depths),"inverse":container.program(79, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":161,"column":40},"end":{"line":165,"column":47}}})) != null ? stack1 : "")
    + "                                    </a>\n";
},"67":function(container,depth0,helpers,partials,data) {
    return "#d6d8dd";
},"69":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"isSafe") : depth0),{"name":"if","hash":{},"fn":container.program(70, data, 0),"inverse":container.program(72, data, 0),"data":data,"loc":{"start":{"line":153,"column":99},"end":{"line":153,"column":194}}})) != null ? stack1 : "");
},"70":function(container,depth0,helpers,partials,data) {
    return "#d1e1d1";
},"72":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"isSuspicious") : depth0),{"name":"if","hash":{},"fn":container.program(73, data, 0),"inverse":container.program(75, data, 0),"data":data,"loc":{"start":{"line":153,"column":133},"end":{"line":153,"column":187}}})) != null ? stack1 : "");
},"73":function(container,depth0,helpers,partials,data) {
    return "#e5e38e";
},"75":function(container,depth0,helpers,partials,data) {
    return "#efe2e2";
},"77":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                            "
    + container.escapeExpression(container.lambda((depths[1] != null ? lookupProperty(depths[1],"domain") : depths[1]), depth0))
    + "\n";
},"79":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                            <span style=\"font-size: .6rem\">#</span>"
    + container.escapeExpression((lookupProperty(helpers,"inc")||(depth0 && lookupProperty(depth0,"inc"))||container.hooks.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),(data && lookupProperty(data,"index")),{"name":"inc","hash":{},"data":data,"loc":{"start":{"line":164,"column":83},"end":{"line":164,"column":97}}}))
    + "\n";
},"81":function(container,depth0,helpers,partials,data) {
    return "\n";
},"83":function(container,depth0,helpers,partials,data) {
    return "        <style>\n            .loader {\n                margin-top: 15px;\n                height: 9px;\n                width: 60px;\n                --c:no-repeat linear-gradient(#17b 0 0);\n                background: var(--c), var(--c), var(--c), var(--c);\n                background-size: 26% 3px;\n                animation: l5 1s infinite;\n            }\n            @keyframes l5 {\n                0%,\n                70%,\n                100% {background-position: calc(0*100%/3) 50% ,calc(1*100%/3) 50% ,calc(2*100%/3) 50% ,calc(3*100%/3) 50% }\n                12.5%{background-position: calc(0*100%/3) 0   ,calc(1*100%/3) 50% ,calc(2*100%/3) 50% ,calc(3*100%/3) 50% }\n                25%  {background-position: calc(0*100%/3) 0   ,calc(1*100%/3) 100%,calc(2*100%/3) 50% ,calc(3*100%/3) 50% }\n                37.5%{background-position: calc(0*100%/3) 0   ,calc(1*100%/3) 100%,calc(2*100%/3) 0   ,calc(3*100%/3) 50% }\n                50%,\n                60%  {background-position: calc(0*100%/3) 0   ,calc(1*100%/3) 100%,calc(2*100%/3) 0   ,calc(3*100%/3) 100%}\n            }\n        </style>\n        <div class=\"loader\"></div>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<hr style=\"opacity: 0.06\"/>\n\n<style>\n    .ww-message {\n        color: rgb(34, 34, 34);\n        font-size: .8125rem;\n        margin-top: 5px\n    }\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":4},"end":{"line":26,"column":11}}})) != null ? stack1 : "")
    + "</style>\n\n<div class=\"ww-buttons\">\n    <button title=\""
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(depth0 != null ? lookupProperty(depth0,"visible") : depth0),{"name":"unless","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.program(6, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":30,"column":19},"end":{"line":30,"column":78}}})) != null ? stack1 : "")
    + "\" type=\"button\" style=\"vertical-align: middle; background-color: "
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(depth0 != null ? lookupProperty(depth0,"visible") : depth0),{"name":"unless","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.program(10, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":30,"column":143},"end":{"line":30,"column":195}}})) != null ? stack1 : "")
    + "; padding: 9px; padding-bottom: 7px;\" class=\"mainbg radius\" data-wwid=\"toggle-hidden\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FFF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle></svg>\n    </button>\n\n    <button title=\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isTempSaved") : depth0),{"name":"if","hash":{},"fn":container.program(12, data, 0, blockParams, depths),"inverse":container.program(14, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":34,"column":19},"end":{"line":34,"column":90}}})) != null ? stack1 : "")
    + "\" style=\"border-radius: 3px; vertical-align: middle; padding: 9px; padding-bottom: 7px; background-color: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isTempSaved") : depth0),{"name":"if","hash":{},"fn":container.program(16, data, 0, blockParams, depths),"inverse":container.program(18, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":34,"column":196},"end":{"line":34,"column":244}}})) != null ? stack1 : "")
    + "\" data-wwid=\"temp-save\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"\n             fill=\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isTempSaved") : depth0),{"name":"if","hash":{},"fn":container.program(20, data, 0, blockParams, depths),"inverse":container.program(22, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":36,"column":19},"end":{"line":36,"column":64}}})) != null ? stack1 : "")
    + "\"\n             stroke=\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isTempSaved") : depth0),{"name":"if","hash":{},"fn":container.program(22, data, 0, blockParams, depths),"inverse":container.program(24, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":37,"column":21},"end":{"line":37,"column":63}}})) != null ? stack1 : "")
    + "\" stroke-width=\"2\">\n            <polygon points=\"12,2 15,10 23,10 17,14 19,22 12,17 5,22 7,14 1,10 9,10\"/>\n        </svg>\n    </button>\n\n    <button title=\"Analiza telefon\" type=\"button\" style=\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"hasNoPhone") : depth0),{"name":"if","hash":{},"fn":container.program(26, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":42,"column":57},"end":{"line":42,"column":95}}})) != null ? stack1 : "")
    + " vertical-align: middle; padding: 9px; padding-bottom: 7px;\"  class=\"mainbg radius\" data-wwid=\"investigate\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FFF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"11\" r=\"8\"></circle><line x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"></line></svg>\n    </button>\n    <button title=\"Analiza imagine\" type=\"button\" style=\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"hasNoPhone") : depth0),{"name":"if","hash":{},"fn":container.program(26, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":45,"column":57},"end":{"line":45,"column":95}}})) != null ? stack1 : "")
    + " vertical-align: middle; padding: 9px; padding-bottom: 7px;\" class=\"mainbg radius\" data-wwid=\"investigate_img\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FFF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><path d=\"M20.4 14.5L16 10 4 20\"/></svg>\n    </button>\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"nimfomaneLink") : depth0),{"name":"if","hash":{},"fn":container.program(28, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":49,"column":4},"end":{"line":66,"column":11}}})) != null ? stack1 : "")
    + "</div>\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"dueToPhoneHidden") : depth0),{"name":"if","hash":{},"fn":container.program(33, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":69,"column":0},"end":{"line":71,"column":7}}})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"hasNoPhone") : depth0),{"name":"if","hash":{},"fn":container.program(35, data, 0, blockParams, depths),"inverse":container.program(37, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":74,"column":0},"end":{"line":200,"column":7}}})) != null ? stack1 : "");
},"useData":true,"useDepths":true});
templates['ads_modal_template'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "padding-left: 10px; padding-right: 10px";
},"3":function(container,depth0,helpers,partials,data) {
    return "-1px";
},"5":function(container,depth0,helpers,partials,data) {
    return "-5px";
},"7":function(container,depth0,helpers,partials,data) {
    return "13px";
},"9":function(container,depth0,helpers,partials,data) {
    return "25px";
},"11":function(container,depth0,helpers,partials,data) {
    return "margin-top:105px;";
},"13":function(container,depth0,helpers,partials,data) {
    return "10px";
},"15":function(container,depth0,helpers,partials,data) {
    return "20px";
},"17":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "value=\""
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"phone") || (depth0 != null ? lookupProperty(depth0,"phone") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"phone","hash":{},"data":data,"loc":{"start":{"line":89,"column":124},"end":{"line":89,"column":133}}}) : helper)))
    + "\" disabled";
},"19":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <span style=\"float: left; padding-left: 5px; font-style: italic; font-size: .85rem; opacity: 0.8; color: #8b5454\">\n                        ("
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"removed") || (depth0 != null ? lookupProperty(depth0,"removed") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"removed","hash":{},"data":data,"loc":{"start":{"line":94,"column":25},"end":{"line":94,"column":36}}}) : helper)))
    + " nu sa mai încărcat)\n                    </span>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<style>\n    .modal_top_border {\n        display: block;\n        height: 2px;\n        width: 100%;\n        position: sticky;\n        background: #17b;\n        top: 78px;\n        z-index: 10;\n        margin: auto;\n        margin-top: -2px\n    }\n    @media screen and (max-width: 640px) {\n        .modal_top_border {\n            top: 75px;\n        }\n    }\n</style>\n\n<div style=\"position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            z-index: 10000;\n            overflow-y: scroll;\n\">\n    <div style=\"\n        pointer-events: none;\n        position: sticky;\n        width: 100%;\n        height: 100%;\n        top: 0;\n        left: 0;\n        background: rgba(0,0,0,0.85);\n        backdrop-filter: blur(10px);\n        margin-bottom: -100vh;\n    \"></div>\n\n    <div style=\"position: sticky;\n            z-index: 1;\n            top: 0;\n            width: 100%;\n            max-width: 1000px;\n            margin: auto;\n            padding-top: 15px;\n            padding-bottom: 15px;\n            background: #27272794;\n            backdrop-filter: blur(10px);\n            display: table;\n            "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":51,"column":12},"end":{"line":51,"column":80}}})) != null ? stack1 : "")
    + "\n    \">\n        <h2 style=\" font-weight: bold;\n                color: #ffffff;\n                float: left;\n                text-shadow: 2px 2px 2px rgba(0, 0, 0, .2);\n                background: #17b;\n                padding: 5px 20px;\n                border-radius: 10px;\n                margin-top: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.program(5, data, 0),"data":data,"loc":{"start":{"line":60,"column":28},"end":{"line":60,"column":73}}})) != null ? stack1 : "")
    + ";\">\n            Anunțuri\n        </h2>\n        <button type=\"button\" class=\"mainbg radius\" style=\"float: right; border-radius: 1000px; padding: 11px; line-height: 0; background: rgba(255,255,255,0.6)\" data-wwid=\"close\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\n                <line x1=\"4\" y1=\"4\" x2=\"20\" y2=\"20\" stroke=\"black\" stroke-width=\"2\"/>\n                <line x1=\"20\" y1=\"4\" x2=\"4\" y2=\"20\" stroke=\"black\" stroke-width=\"2\"/>\n            </svg>\n        </button>\n        <button type=\"button\" class=\"radius\" style=\"color: black;float: right;line-height: 0;background: #c59b2f;\n                margin-right: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":70,"column":30},"end":{"line":70,"column":75}}})) != null ? stack1 : "")
    + ";padding: 13px;\" data-wwid=\"hide-all\">\n            <b>ascunde toate</b>\n        </button>\n    </div>\n\n    <div class=\"rmd-container-search-results\" style=\"\n        border: 2px solid #17b;\n        width: 100%;\n        max-width: 1000px;\n        padding: 0 !important;\n        background: #ececec;\n        border-radius: 0 0 10px 10px;\n        margin: auto;\n        margin-bottom: 150px;\n        position: relative;\n        "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":85,"column":8},"end":{"line":85,"column":54}}})) != null ? stack1 : "")
    + "\n    \" onclick=\"event.stopPropagation()\">\n        <div class=\"modal_top_border\"></div>\n        <div style=\"padding: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(15, data, 0),"data":data,"loc":{"start":{"line":88,"column":29},"end":{"line":88,"column":74}}})) != null ? stack1 : "")
    + " ;\">\n            <input type=\"text\" style=\"font-weight: bold; font-size: 1.2rem\" placeholder=\"Număr telefon\" "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"phone") : depth0),{"name":"if","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":89,"column":104},"end":{"line":89,"column":150}}})) != null ? stack1 : "")
    + "/>\n            <p style=\"color: rgb(55 55 55); font-size: .95rem; padding-bottom: 10px; padding-top: 10px; display: table; width: 100%;\">\n                <strong style=\"float: left\">Rezultate: <span data-wwid=\"count\">"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"count") || (depth0 != null ? lookupProperty(depth0,"count") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"count","hash":{},"data":data,"loc":{"start":{"line":91,"column":79},"end":{"line":91,"column":88}}}) : helper)))
    + "</span></strong>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"removed") : depth0),{"name":"if","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":92,"column":16},"end":{"line":96,"column":23}}})) != null ? stack1 : "")
    + "                <span style=\"float: right; font-style: italic; font-size: .85rem; opacity: 0.8\">\n                    Pot sa fie mai multe care încă nu au fost analizate.\n                </span>\n            </p>\n\n            <div data-wwid=\"content\">\n                "
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"content") || (depth0 != null ? lookupProperty(depth0,"content") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"content","hash":{},"data":data,"loc":{"start":{"line":103,"column":16},"end":{"line":103,"column":29}}}) : helper))) != null ? stack1 : "")
    + "\n            </div>\n        </div>\n    </div>\n</div>\n";
},"useData":true});
templates['ads_template'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <div class=\"article-item\" data-articleid=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"id") : depth0), depth0))
    + "\"\n         style=\"margin-bottom: 30px;\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,(depth0 != null ? lookupProperty(depth0,"duplicate") : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":116,"column":16},"end":{"line":121,"column":23}}})) != null ? stack1 : "")
    + "                \"\n         onclick=\"window.open('"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"url") : depth0), depth0))
    + "', '_blank')\"\n    >\n        <div class=\"article-txt-wrap\">\n            <div class=\"article-txt\">\n                <div class=\"article-content-wrap\" style=\"overflow: visible\">\n                    <div class=\"art-img\">\n                        <a><img src=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"image") : depth0), depth0))
    + "\" width=\"200\" height=\"200\"/></a>\n                    </div>\n\n                    <div class=\"article-content\">\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,(depth0 != null ? lookupProperty(depth0,"duplicate") : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":133,"column":24},"end":{"line":135,"column":31}}})) != null ? stack1 : "")
    + "                        <h2 class=\"article-title\"><a href=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"url") : depth0), depth0))
    + "\" target=\"_blank\">"
    + alias2(((helper = (helper = lookupProperty(helpers,"title") || (depth0 != null ? lookupProperty(depth0,"title") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias3,{"name":"title","hash":{},"data":data,"loc":{"start":{"line":136,"column":89},"end":{"line":136,"column":98}}}) : helper)))
    + "</a></h2>\n                        <p style=\"display: block\" class=\"article-description\">"
    + ((stack1 = alias1((depth0 != null ? lookupProperty(depth0,"description") : depth0), depth0)) != null ? stack1 : "")
    + "</p>\n\n                        <div style=\"float: left\">\n                            <p class=\"article-location\">\n                                <i class=\"svg-icon svg-icon-article\">\n                                    <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 384 512\" "
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,(depth0 != null ? lookupProperty(depth0,"isLocationDifferent") : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":142,"column":98},"end":{"line":142,"column":154}}})) != null ? stack1 : "")
    + "><path d=\"M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z\"></path></svg>\n                                </i>\n                                <span "
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,(depth0 != null ? lookupProperty(depth0,"isLocationDifferent") : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":144,"column":38},"end":{"line":144,"column":114}}})) != null ? stack1 : "")
    + ">"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"location") : depth0), depth0))
    + "</span>\n                            </p>\n\n                            <p class=\"article-date\">\n                                <i class=\"svg-icon svg-icon-article\">\n                                    <svg viewBox=\"0 0 50 50\" aria-hidden=\"true\" "
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,(depth0 != null ? lookupProperty(depth0,"isDateOld") : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":149,"column":80},"end":{"line":149,"column":126}}})) != null ? stack1 : "")
    + "><use xlink:href=\"#svg-icon-calendar\"></use></svg>\n                                </i>\n                                <span "
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,(depth0 != null ? lookupProperty(depth0,"isDateOld") : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":151,"column":38},"end":{"line":151,"column":104}}})) != null ? stack1 : "")
    + ">"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"date") : depth0), depth0))
    + "</span>\n                            </p>\n                        </div>\n\n"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias3,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"unless","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":155,"column":24},"end":{"line":161,"column":35}}})) != null ? stack1 : "")
    + "                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "                    margin-top: -35px;\n                    border-top-right-radius: 0;\n                    border-top-left-radius: 0;\n                    border-top: none;\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "                            <h3 class=\"article-title\" style=\"color: #c59b2f\">(duplicat)</h3>\n";
},"6":function(container,depth0,helpers,partials,data) {
    return "style=\"fill: #964f4f\" ";
},"8":function(container,depth0,helpers,partials,data) {
    return "style=\"color: #964f4f; font-weight: bold\" ";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"qrCode") : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":156,"column":28},"end":{"line":160,"column":35}}})) != null ? stack1 : "");
},"11":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                <div class=\"qr-code\" style=\"float: right\">\n                                    <img src=\""
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"qrCode") : depth0), depth0))
    + "\" title=\"scaneaza pt telefon\" width=\"85\"/>\n                                </div>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<style>\n    .article-item {\n        text-decoration: none;\n        background: #fefefe;\n        box-shadow: -2px -2px 6px rgba(154, 168, 192, .2), 2px 5px 11px rgba(154, 168, 192, .2);\n        border: 1px solid #ddd;\n        font-family: var(--primary-font-family);\n        border-radius: 8px;\n        transition: all .1s ease-in;\n    }\n    .article-txt {\n        width: 100%;\n        border: 16px solid #fff;\n        border-radius: 8px;\n        overflow: hidden;\n    }\n    .article-content {\n        width: 100%;\n    }\n    .article-content-wrap {\n        display: flex;\n        justify-content: space-between;\n        flex-direction: row;\n        gap: 12px;\n        height: auto;\n    }\n    .art-img {\n        position: relative;\n        min-width: 150px;\n        width: 150px;\n        height: 180px;\n        border-radius: 4px;\n    }\n    .art-img img {\n        object-fit: cover;\n        width: 100%;\n        height: 100%;\n        border-radius: 4px;\n    }\n    .article-title {\n        display: block;\n        float: none !important;\n        margin-bottom: 8px;\n        font-family: var(--primary-font-family);\n        font-size: 13px;\n        font-weight: 600;\n        line-height: 1.4;\n        color: #444;\n        overflow: hidden;\n    }\n    .article-description {\n        max-height: 35px;\n        overflow: hidden;\n        margin: 4px 0 8px;\n        font-family: var(--secondary-font-family);\n        font-size: 13px;\n        font-weight: 400;\n        line-height: 1.4;\n        color: #444;\n    }\n    .article-location, .article-date {\n        margin-bottom: 0;\n        font-family: var(--secondary-font-family);\n        font-size: 12px;\n        font-weight: 400;\n        line-height: 1.4;\n        color: #999;\n    }\n    .svg-icon-article {\n        display: inline-block;\n        margin-right: .25rem;\n        width: 24px;\n        text-align: left;\n        margin-right: 0 !important;\n    }\n    .svg-icon-article svg {\n        position: relative;\n        margin-top: 0;\n        width: 12px;\n        height: auto;\n        vertical-align: middle;\n        top: -2px;\n        fill: #999;\n    }\n    @media screen and (min-width: 861px) {\n        .art-img {\n            min-width: 260px;\n            width: 260px;\n            height: 200px;\n        }\n        .article-title {\n            font-size: 16px !important;\n        }\n        .article-location, .article-date {\n            font-size: 14px !important;\n        }\n    }\n    @media screen and (min-width: 641px) {\n        .art-img {\n            min-width: 180px;\n            width: 180px;\n            height: 180px;\n        }\n\n        .article-title {\n            font-size: 15px !important;\n        }\n        .article-location, .article-date {\n            font-size: 13px !important;\n        }\n    }\n</style>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"itemData") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":113,"column":0},"end":{"line":167,"column":9}}})) != null ? stack1 : "");
},"useData":true});
templates['favorites_modal_template'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "padding-left: 10px; padding-right: 10px";
},"3":function(container,depth0,helpers,partials,data) {
    return "-1px";
},"5":function(container,depth0,helpers,partials,data) {
    return "-10px";
},"7":function(container,depth0,helpers,partials,data) {
    return "13px";
},"9":function(container,depth0,helpers,partials,data) {
    return "25px";
},"11":function(container,depth0,helpers,partials,data) {
    return "margin-top:105px;";
},"13":function(container,depth0,helpers,partials,data) {
    return "10px";
},"15":function(container,depth0,helpers,partials,data) {
    return "20px";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<style>\n    .modal_top_border {\n        display: block;\n        height: 2px;\n        width: 100%;\n        position: sticky;\n        background: #b34c4c;\n        top: 78px;\n        z-index: 10;\n        margin: auto;\n        margin-top: -2px\n    }\n    @media screen and (max-width: 640px) {\n        .modal_top_border {\n            top: 75px;\n        }\n    }\n</style>\n\n<div style=\"position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            z-index: 10000;\n            overflow-y: scroll;\n\">\n    <div style=\"\n        pointer-events: none;\n        position: sticky;\n        width: 100%;\n        height: 100%;\n        top: 0;\n        left: 0;\n        background: rgba(0,0,0,0.85);\n        backdrop-filter: blur(10px);\n        margin-bottom: -100vh;\n    \"></div>\n\n    <div style=\"position: sticky;\n            z-index: 1;\n            top: 0;\n            width: 100%;\n            max-width: 1000px;\n            margin: auto;\n            padding-top: 15px;\n            padding-bottom: 15px;\n            background: #27272794;\n            backdrop-filter: blur(10px);\n            display: table;\n            "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":51,"column":12},"end":{"line":51,"column":80}}})) != null ? stack1 : "")
    + "\n    \">\n        <h2 style=\" font-weight: bold;\n                color: #edd492;\n                float: left;\n                text-shadow: 2px 2px 2px rgba(0, 0, 0, .2);\n                background: #b34c4c;\n                padding: 5px 20px;\n                border-radius: 10px;\n                margin-top: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.program(5, data, 0),"data":data,"loc":{"start":{"line":60,"column":28},"end":{"line":60,"column":74}}})) != null ? stack1 : "")
    + ";\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 30\" fill=\"#edd492\" style=\"\n                        vertical-align: middle;\n                        transform: scale(2);\n                    \">\n                <polygon points=\"12,2 15,10 23,10 17,14 19,22 12,17 5,22 7,14 1,10 9,10\"/>\n            </svg> Favorite\n        </h2>\n        <button type=\"button\" class=\"mainbg radius\" style=\"float: right; border-radius: 1000px; padding: 11px; line-height: 0; background: rgba(255,255,255,0.6)\" data-wwid=\"close\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\n                <line x1=\"4\" y1=\"4\" x2=\"20\" y2=\"20\" stroke=\"black\" stroke-width=\"2\"/>\n                <line x1=\"20\" y1=\"4\" x2=\"4\" y2=\"20\" stroke=\"black\" stroke-width=\"2\"/>\n            </svg>\n        </button>\n        <button type=\"button\" class=\"radius\" style=\"color: black;float: right;line-height: 0;background: rgba(255,255,255,0.6);\n                margin-right: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":75,"column":30},"end":{"line":75,"column":75}}})) != null ? stack1 : "")
    + ";padding: 13px;\" data-wwid=\"clear-favorites\">\n            <b>șterge lista</b>\n        </button>\n    </div>\n\n    <div class=\"rmd-container-search-results\" style=\"\n            border: 2px solid #b34c4c;\n            width: 100%;\n            max-width: 1000px;\n            background: #ececec;\n            border-radius: 0 0 10px 10px;\n            margin: auto;\n            margin-bottom: 150px;\n            position: relative;\n            padding: 0 !important;\n            "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":90,"column":12},"end":{"line":90,"column":58}}})) != null ? stack1 : "")
    + "\n    \" onclick=\"event.stopPropagation()\">\n        <div class=\"modal_top_border\"></div>\n        <div style=\"padding: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(15, data, 0),"data":data,"loc":{"start":{"line":93,"column":29},"end":{"line":93,"column":74}}})) != null ? stack1 : "")
    + ";\">\n            "
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"content") || (depth0 != null ? lookupProperty(depth0,"content") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"content","hash":{},"data":data,"loc":{"start":{"line":94,"column":12},"end":{"line":94,"column":25}}}) : helper))) != null ? stack1 : "")
    + "\n        </div>\n    </div>\n</div>\n";
},"useData":true});
templates['global_buttons_template'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "64px";
},"3":function(container,depth0,helpers,partials,data) {
    return "80px";
},"5":function(container,depth0,helpers,partials,data) {
    return "            left: 10px;\n            padding: 17px;\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "            padding: 9px;\n            left: calc(50% - 120px);\n            transform: translateX(-50%);\n";
},"9":function(container,depth0,helpers,partials,data) {
    return "            left: 76px;\n            padding: 17px;\n";
},"11":function(container,depth0,helpers,partials,data) {
    return "            padding: 9px;\n            left: calc(50% + 120px);\n            transform: translateX(-50%);\n";
},"13":function(container,depth0,helpers,partials,data) {
    return "#c59b2f";
},"15":function(container,depth0,helpers,partials,data) {
    return "#949494";
},"17":function(container,depth0,helpers,partials,data) {
    return "#c39020";
},"19":function(container,depth0,helpers,partials,data) {
    return "#808080";
},"21":function(container,depth0,helpers,partials,data) {
    return "            left: 140px;\n            padding-left: 36px;\n";
},"23":function(container,depth0,helpers,partials,data) {
    return "            left: 50%;\n            transform: translateX(-50%);\n            min-width: 180px;\n";
},"25":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return container.escapeExpression(((helper = (helper = lookupProperty(helpers,"savesCount") || (depth0 != null ? lookupProperty(depth0,"savesCount") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"savesCount","hash":{},"data":data,"loc":{"start":{"line":91,"column":34},"end":{"line":91,"column":48}}}) : helper)));
},"27":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Favorite ("
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"savesCount") || (depth0 != null ? lookupProperty(depth0,"savesCount") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"savesCount","hash":{},"data":data,"loc":{"start":{"line":91,"column":66},"end":{"line":91,"column":80}}}) : helper)))
    + ")";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<style>\n    .ww-phone-search-button {\n        position: fixed;\n        bottom: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":4,"column":16},"end":{"line":4,"column":62}}})) != null ? stack1 : "")
    + ";\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data,"loc":{"start":{"line":5,"column":8},"end":{"line":12,"column":15}}})) != null ? stack1 : "")
    + "        padding-bottom: 6px;\n        padding-top: 8px;\n        font-weight: bold;\n        background: #17b;\n        border-radius: 6px;\n        border: 1px solid white;\n        box-shadow: 1px 1px 4px 2px rgba(0, 0, 0, .2);\n    }\n    .ww-phone-search-button:hover {\n        background: #0b629b;\n    }\n</style>\n\n<button class=\"ww-phone-search-button\" data-ww=\"phone-search\" title=\"Caută după număr de telefon\">\n    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FFF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"11\" r=\"8\"></circle><line x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"></line></svg>\n</button>\n\n<style>\n    .ww-focus-button {\n        position: fixed;\n        bottom: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":33,"column":16},"end":{"line":33,"column":62}}})) != null ? stack1 : "")
    + ";\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.program(11, data, 0),"data":data,"loc":{"start":{"line":34,"column":8},"end":{"line":41,"column":15}}})) != null ? stack1 : "")
    + "        padding-bottom: 6px;\n        padding-top: 9px;\n        font-weight: bold;\n        background: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isFocusOn") : depth0),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(15, data, 0),"data":data,"loc":{"start":{"line":45,"column":20},"end":{"line":45,"column":66}}})) != null ? stack1 : "")
    + ";\n        border-radius: 6px;\n        border: 1px solid white;\n        box-shadow: 1px 1px 4px 2px rgba(0, 0, 0, .2);\n    }\n    .ww-focus-button:hover {\n        background: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isFocusOn") : depth0),{"name":"if","hash":{},"fn":container.program(17, data, 0),"inverse":container.program(19, data, 0),"data":data,"loc":{"start":{"line":51,"column":20},"end":{"line":51,"column":66}}})) != null ? stack1 : "")
    + ";\n    }\n</style>\n\n<button class=\"ww-focus-button\" data-ww=\"focus-mode\" title=\"Focus mode\">\n    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"22\" height=\"22\" viewBox=\"0 0 24 24\"><path fill=\"#FFF\" d=\"M3,9A1,1,0,0,0,4,8V5A1,1,0,0,1,5,4H8A1,1,0,0,0,8,2H5A3,3,0,0,0,2,5V8A1,1,0,0,0,3,9ZM8,20H5a1,1,0,0,1-1-1V16a1,1,0,0,0-2,0v3a3,3,0,0,0,3,3H8a1,1,0,0,0,0-2Zm9-7a1,1,0,0,0,0-2H15.86A4,4,0,0,0,13,8.14V7a1,1,0,0,0-2,0V8.14A4,4,0,0,0,8.14,11H7a1,1,0,0,0,0,2H8.14A4,4,0,0,0,11,15.86V17a1,1,0,0,0,2,0V15.86A4,4,0,0,0,15.86,13Zm-5,1a2,2,0,1,1,2-2A2,2,0,0,1,12,14Zm9,1a1,1,0,0,0-1,1v3a1,1,0,0,1-1,1H16a1,1,0,0,0,0,2h3a3,3,0,0,0,3-3V16A1,1,0,0,0,21,15ZM19,2H16a1,1,0,0,0,0,2h3a1,1,0,0,1,1,1V8a1,1,0,0,0,2,0V5A3,3,0,0,0,19,2Z\"/></svg>\n</button>\n\n<style>\n    .ww-saves-button {\n        position: fixed;\n    bottom: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":62,"column":12},"end":{"line":62,"column":58}}})) != null ? stack1 : "")
    + ";\n        padding: 12px;\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(21, data, 0),"inverse":container.program(23, data, 0),"data":data,"loc":{"start":{"line":64,"column":8},"end":{"line":71,"column":15}}})) != null ? stack1 : "")
    + "        font-weight: bold;\n        background: #b34c4c;\n        border-radius: 6px;\n        border: 1px solid white;\n        box-shadow: 1px 1px 4px 2px rgba(0, 0, 0, .2);\n    }\n    .ww-saves-button:hover {\n        background: #a12a2a;\n    }\n</style>\n\n<button class=\"ww-saves-button\" data-ww=\"temp-save\">\n    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 30\" fill=\"white\" style=\"\n        vertical-align: middle;\n        position: absolute;\n        transform: scale(1.4);\n        left: 12px;\n    \">\n        <polygon points=\"12,2 15,10 23,10 17,14 19,22 12,17 5,22 7,14 1,10 9,10\"/>\n    </svg> "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(25, data, 0),"inverse":container.program(27, data, 0),"data":data,"loc":{"start":{"line":91,"column":11},"end":{"line":91,"column":88}}})) != null ? stack1 : "")
    + "\n</button>\n";
},"useData":true});
templates['slider_template'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "right: 30px;";
},"3":function(container,depth0,helpers,partials,data) {
    return "left: 50%; transform: translate(-50%, 0);";
},"5":function(container,depth0,helpers,partials,data) {
    return "#696969";
},"7":function(container,depth0,helpers,partials,data) {
    return "#c59b2f";
},"9":function(container,depth0,helpers,partials,data) {
    return "right: 120px;";
},"11":function(container,depth0,helpers,partials,data) {
    return "left: 70px;";
},"13":function(container,depth0,helpers,partials,data) {
    return "                <li class=\"splide__slide\">\n                    <img onclick=\"event.stopPropagation()\" style='max-width: 100%;\n                                max-height: 100%;\n                                display: block;\n                                margin: auto;\n                                box-shadow: 5px 5px 15px 3px rgba(0,0,0,.3);\n                                border-radius: 5px;\n                                ' src=\""
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "\"/>\n                </li>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div style=\"position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            background: rgba(0,0,0,0.85);\n            z-index: 10000;\n            padding: 30px;\n            padding-bottom: 100px;\n            backdrop-filter: blur(10px);\n\">\n        <div style=\"position: absolute; bottom: 30px;"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":12,"column":53},"end":{"line":12,"column":143}}})) != null ? stack1 : "")
    + "\">\n        <button type=\"button\" style=\"vertical-align: middle; background-color: "
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(depth0 != null ? lookupProperty(depth0,"visible") : depth0),{"name":"unless","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data,"loc":{"start":{"line":13,"column":79},"end":{"line":13,"column":131}}})) != null ? stack1 : "")
    + "; padding: 9px; padding-bottom: 7px; position: absolute; right: 70px;\" class=\"mainbg radius\" data-wwid=\"toggle-hidden\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FFF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle></svg>\n        </button>\n        <button type=\"button\" style=\"position: absolute; "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.program(11, data, 0),"data":data,"loc":{"start":{"line":16,"column":57},"end":{"line":16,"column":118}}})) != null ? stack1 : "")
    + " vertical-align: middle; padding: 9px; padding-bottom: 7px;\" class=\"mainbg radius\" data-wwid=\"analyze-images\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FFF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><path d=\"M20.4 14.5L16 10 4 20\"/></svg>\n        </button>\n        <button type=\"button\" class=\"mainbg radius\" style=\"border-radius: 1000px; padding: 11px; line-height: 0; background: rgba(255,255,255,0.6)\" data-wwid=\"close\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\n                <line x1=\"4\" y1=\"4\" x2=\"20\" y2=\"20\" stroke=\"black\" stroke-width=\"2\"/>\n                <line x1=\"20\" y1=\"4\" x2=\"4\" y2=\"20\" stroke=\"black\" stroke-width=\"2\"/>\n            </svg>\n        </button>\n    </div>\n    <section class=\"splide\" style=\"height: 100%\">\n        <style>.splide__track {height: 100%} .splide__track {overflow-y: visible !important;}</style>\n        <div class=\"splide__track\">\n            <ul class=\"splide__list\" style=\"height: 100%\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"images") : depth0),{"name":"each","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":30,"column":16},"end":{"line":40,"column":25}}})) != null ? stack1 : "")
    + "            </ul>\n        </div>\n    </section>\n</div>\n";
},"useData":true});
})();