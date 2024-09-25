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
    return "#cb2727";
},"10":function(container,depth0,helpers,partials,data) {
    return "none";
},"12":function(container,depth0,helpers,partials,data) {
    return "#333";
},"14":function(container,depth0,helpers,partials,data) {
    return "display:none;";
},"16":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <a href='"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"nimfomaneLink") || (depth0 != null ? lookupProperty(depth0,"nimfomaneLink") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"nimfomaneLink","hash":{},"data":data,"loc":{"start":{"line":50,"column":17},"end":{"line":50,"column":34}}}) : helper)))
    + "' target='_blank' style='position: relative; display: inline-block;'>\n            <svg\n                    style='position: absolute;\n               width: 20px;\n               height: 20px;\n               margin-top: 2px;\n               margin-left: 2px;'\n                    xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\">\n                <polygon fill='#8fc38f' points=\"2.67 7.63 5.46 10.41 13.33 2.54 14.85 4.06 5.46 13.46 1.15 9.15 2.67 7.63\"/>\n            </svg>\n            <img style='background: #2f4979;\n                "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(17, data, 0),"inverse":container.program(19, data, 0),"data":data,"loc":{"start":{"line":61,"column":16},"end":{"line":61,"column":77}}})) != null ? stack1 : "")
    + "\n                    border-radius: 4px;\n                    padding: 12px;'\n                 src='https://nimfomane.com/forum/uploads/monthly_2024_01/logo2.png.d461ead015b3eddf20bc0a9b70668583.png'/>\n        </a>\n";
},"17":function(container,depth0,helpers,partials,data) {
    return "width:94px;";
},"19":function(container,depth0,helpers,partials,data) {
    return "height: 45px;";
},"21":function(container,depth0,helpers,partials,data) {
    return "    <p style=\"\" class=\"ww-message\">ai mai ascuns un anunț cu acceeași numar de telefon; ascuns automat</p>\n";
},"23":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"hasNoPhone") : depth0),{"name":"if","hash":{},"fn":container.program(24, data, 0, blockParams, depths),"inverse":container.program(26, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":74,"column":4},"end":{"line":135,"column":11}}})) != null ? stack1 : "");
},"24":function(container,depth0,helpers,partials,data) {
    return "        <p style=\"color: rgb(34, 34, 34); font-size: .8125rem;\" class=\"ww-message\">anuntul nu are nr telefon;</p>\n";
},"26":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"phone") : depth0),{"name":"if","hash":{},"fn":container.program(27, data, 0, blockParams, depths),"inverse":container.program(52, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":77,"column":8},"end":{"line":134,"column":15}}})) != null ? stack1 : "");
},"27":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <div class=\"ww-results\">\n                <h4 style='font-weight: bold; padding-top: 10px;'>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(28, data, 0, blockParams, depths),"inverse":container.program(30, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":80,"column":20},"end":{"line":84,"column":27}}})) != null ? stack1 : "")
    + "                </h4>\n                <h5 style=\"margin-top: 5px; margin-bottom: 3px; font-size: 1.125rem\">Rezultate după telefon</h5>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(lookupProperty(helpers,"isUndefined")||(depth0 && lookupProperty(depth0,"isUndefined"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"searchLinks") : depth0),{"name":"isUndefined","hash":{},"data":data,"loc":{"start":{"line":87,"column":22},"end":{"line":87,"column":47}}}),{"name":"if","hash":{},"fn":container.program(32, data, 0, blockParams, depths),"inverse":container.program(34, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":87,"column":16},"end":{"line":98,"column":23}}})) != null ? stack1 : "")
    + "\n                <h5 style=\"margin-top: 5px; margin-bottom: 3px; font-size: 1.125rem\">Rezultate după imagine</h5>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(lookupProperty(helpers,"isUndefined")||(depth0 && lookupProperty(depth0,"isUndefined"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"imageSearchDomains") : depth0),{"name":"isUndefined","hash":{},"data":data,"loc":{"start":{"line":101,"column":22},"end":{"line":101,"column":54}}}),{"name":"if","hash":{},"fn":container.program(32, data, 0, blockParams, depths),"inverse":container.program(40, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":101,"column":16},"end":{"line":130,"column":23}}})) != null ? stack1 : "")
    + "            </div>\n";
},"28":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                        <a href=\"tel:"
    + alias4(((helper = (helper = lookupProperty(helpers,"phone") || (depth0 != null ? lookupProperty(depth0,"phone") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"phone","hash":{},"data":data,"loc":{"start":{"line":81,"column":37},"end":{"line":81,"column":46}}}) : helper)))
    + "\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"phone") || (depth0 != null ? lookupProperty(depth0,"phone") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"phone","hash":{},"data":data,"loc":{"start":{"line":81,"column":48},"end":{"line":81,"column":57}}}) : helper)))
    + "</a>\n";
},"30":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                        "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"phone") || (depth0 != null ? lookupProperty(depth0,"phone") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"phone","hash":{},"data":data,"loc":{"start":{"line":83,"column":24},"end":{"line":83,"column":33}}}) : helper)))
    + "\n";
},"32":function(container,depth0,helpers,partials,data) {
    return "                    <p style=\"color: #8b5454; font-size: .8125rem;\">nerulat</p>\n";
},"34":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"filteredSearchLinks") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),{"name":"unless","hash":{},"fn":container.program(35, data, 0),"inverse":container.program(37, data, 0),"data":data,"loc":{"start":{"line":90,"column":20},"end":{"line":97,"column":31}}})) != null ? stack1 : "");
},"35":function(container,depth0,helpers,partials,data) {
    return "                        <p style=\"color: rgb(103,109,92); font-size: .8125rem;\">nu au fost găsite linkuri relevante</p>\n";
},"37":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"filteredSearchLinks") : depth0),{"name":"each","hash":{},"fn":container.program(38, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":93,"column":24},"end":{"line":96,"column":33}}})) != null ? stack1 : "");
},"38":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "                            <div style=\"font-size: .8125rem; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;\">\n                                <a onclick='event.stopPropagation()' href=\""
    + alias2(alias1(depth0, depth0))
    + "\" target=\"_blank\">"
    + alias2(alias1(depth0, depth0))
    + "</a></div>\n";
},"40":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"imageSearchDomains") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),{"name":"unless","hash":{},"fn":container.program(35, data, 0, blockParams, depths),"inverse":container.program(41, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":104,"column":20},"end":{"line":129,"column":31}}})) != null ? stack1 : "");
},"41":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                        <div style=\"font-size: .8125rem;\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"imageSearchDomains") : depth0),{"name":"each","hash":{},"fn":container.program(42, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":108,"column":28},"end":{"line":127,"column":37}}})) != null ? stack1 : "")
    + "                        </div>\n";
},"42":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"links") : depth0),{"name":"each","hash":{},"fn":container.program(43, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":109,"column":32},"end":{"line":126,"column":41}}})) != null ? stack1 : "");
},"43":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                    <a href=\""
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "\" target=\"_blank\"\n                                       style=\"display: inline-block;\n                                               background-color: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depths[1] != null ? lookupProperty(depths[1],"isSafe") : depths[1]),{"name":"if","hash":{},"fn":container.program(44, data, 0, blockParams, depths),"inverse":container.program(46, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":112,"column":65},"end":{"line":112,"column":111}}})) != null ? stack1 : "")
    + ";\n                                               padding: 5px;\n                                               margin-right: 3px;\n                                               margin-bottom: 6px;\n                                               border-radius: 5px;\n                                               text-decoration: none;\n                                               color: rgb(55 55 55);\n                                   \">\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(data && lookupProperty(data,"first")),{"name":"if","hash":{},"fn":container.program(48, data, 0, blockParams, depths),"inverse":container.program(50, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":120,"column":40},"end":{"line":124,"column":47}}})) != null ? stack1 : "")
    + "                                    </a>\n";
},"44":function(container,depth0,helpers,partials,data) {
    return "#d1e1d1";
},"46":function(container,depth0,helpers,partials,data) {
    return "#efe2e2";
},"48":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                            "
    + container.escapeExpression(container.lambda((depths[1] != null ? lookupProperty(depths[1],"domain") : depths[1]), depth0))
    + "\n";
},"50":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                            <span style=\"font-size: .6rem\">#</span>"
    + container.escapeExpression((lookupProperty(helpers,"inc")||(depth0 && lookupProperty(depth0,"inc"))||container.hooks.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),(data && lookupProperty(data,"index")),{"name":"inc","hash":{},"data":data,"loc":{"start":{"line":123,"column":83},"end":{"line":123,"column":97}}}))
    + "\n";
},"52":function(container,depth0,helpers,partials,data) {
    return "            <p style=\"color: rgb(34, 34, 34); font-size: .8125rem;\" class=\"ww-message\">neanalizat</p>\n";
},"54":function(container,depth0,helpers,partials,data) {
    return "\n";
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
    + "\" type=\"button\" style=\"vertical-align: middle; background-color: #c59b2f; padding: 9px; padding-bottom: 7px;\" class=\"mainbg radius\" data-wwid=\"toggle-hidden\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FFF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle></svg>\n    </button>\n\n    <button title=\"Adaugă la favorite\" style=\"border-radius: 3px; vertical-align: middle; padding: 9px; padding-bottom: 7px; background-color: #e0dada\" data-wwid=\"temp-save\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"\n             fill=\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isTempSaved") : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.program(10, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":36,"column":19},"end":{"line":36,"column":64}}})) != null ? stack1 : "")
    + "\"\n             stroke=\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isTempSaved") : depth0),{"name":"if","hash":{},"fn":container.program(10, data, 0, blockParams, depths),"inverse":container.program(12, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":37,"column":21},"end":{"line":37,"column":63}}})) != null ? stack1 : "")
    + "\" stroke-width=\"2\">\n            <polygon points=\"12,2 15,10 23,10 17,14 19,22 12,17 5,22 7,14 1,10 9,10\"/>\n        </svg>\n    </button>\n\n    <button title=\"Analiza telefon\" type=\"button\" style=\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"hasNoPhone") : depth0),{"name":"if","hash":{},"fn":container.program(14, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":42,"column":57},"end":{"line":42,"column":95}}})) != null ? stack1 : "")
    + " vertical-align: middle; padding: 9px; padding-bottom: 7px;\"  class=\"mainbg radius\" data-wwid=\"investigate\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FFF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"11\" r=\"8\"></circle><line x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"></line></svg>\n    </button>\n    <button title=\"Analiza imagine\" type=\"button\" style=\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"hasNoPhone") : depth0),{"name":"if","hash":{},"fn":container.program(14, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":45,"column":57},"end":{"line":45,"column":95}}})) != null ? stack1 : "")
    + " vertical-align: middle; padding: 9px; padding-bottom: 7px;\" class=\"mainbg radius\" data-wwid=\"investigate_img\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FFF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><path d=\"M20.4 14.5L16 10 4 20\"/></svg>\n    </button>\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"nimfomaneLink") : depth0),{"name":"if","hash":{},"fn":container.program(16, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":49,"column":4},"end":{"line":66,"column":11}}})) != null ? stack1 : "")
    + "</div>\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"dueToPhoneHidden") : depth0),{"name":"if","hash":{},"fn":container.program(21, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":69,"column":0},"end":{"line":71,"column":7}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"visible") : depth0),{"name":"if","hash":{},"fn":container.program(23, data, 0, blockParams, depths),"inverse":container.program(54, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":73,"column":0},"end":{"line":138,"column":7}}})) != null ? stack1 : "");
},"useData":true,"useDepths":true});
templates['ads_template'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "5px";
},"3":function(container,depth0,helpers,partials,data) {
    return "30px";
},"5":function(container,depth0,helpers,partials,data) {
    return "10px";
},"7":function(container,depth0,helpers,partials,data) {
    return "20px";
},"9":function(container,depth0,helpers,partials,data) {
    return "-10px";
},"11":function(container,depth0,helpers,partials,data) {
    return "-20px";
},"13":function(container,depth0,helpers,partials,data) {
    return "-1px";
},"15":function(container,depth0,helpers,partials,data) {
    return "13px";
},"17":function(container,depth0,helpers,partials,data) {
    return "25px";
},"19":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <div class=\"article-item\" data-articleid=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"id") : depth0), depth0))
    + "\"\n                 style=\"margin-bottom: 30px;\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,(depth0 != null ? lookupProperty(depth0,"duplicate") : depth0),{"name":"if","hash":{},"fn":container.program(20, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":51,"column":24},"end":{"line":56,"column":31}}})) != null ? stack1 : "")
    + "                        \"\n                 onclick=\"window.open('"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"url") : depth0), depth0))
    + "', '_blank')\"\n            >\n                <div class=\"article-txt-wrap\">\n                    <div class=\"article-txt\" style=\"padding-right: 20px\">\n                        <div class=\"article-content-wrap\" style=\"overflow: visible\">\n                            <div class=\"art-img\">\n                                <a><img src=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"image") : depth0), depth0))
    + "\" width=\"200\" height=\"200\"/></a>\n                            </div>\n\n                            <div class=\"article-content\">\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,(depth0 != null ? lookupProperty(depth0,"duplicate") : depth0),{"name":"if","hash":{},"fn":container.program(22, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":68,"column":32},"end":{"line":70,"column":39}}})) != null ? stack1 : "")
    + "                                <h2 class=\"article-title\"><a href=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"url") : depth0), depth0))
    + "\" target=\"_blank\">"
    + alias2(((helper = (helper = lookupProperty(helpers,"title") || (depth0 != null ? lookupProperty(depth0,"title") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias3,{"name":"title","hash":{},"data":data,"loc":{"start":{"line":71,"column":97},"end":{"line":71,"column":106}}}) : helper)))
    + "</a></h2>\n                                <p style=\"display: block\" class=\"article-description\">"
    + ((stack1 = alias1((depth0 != null ? lookupProperty(depth0,"description") : depth0), depth0)) != null ? stack1 : "")
    + "</p>\n\n                                <p class=\"article-location\" style=\"float: left\">\n                                    <i class=\"svg-icon svg-icon-article\">\n                                        <svg viewBox=\"0 0 50 50\" aria-hidden=\"true\"><use xlink:href=\"#svg-icon-location\"></use></svg>\n                                    </i>\n                                    <span>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"location") : depth0), depth0))
    + "</span>\n                                </p>\n\n"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias3,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"unless","hash":{},"fn":container.program(24, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":81,"column":32},"end":{"line":87,"column":43}}})) != null ? stack1 : "")
    + "                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n";
},"20":function(container,depth0,helpers,partials,data) {
    return "                            margin-top: -35px;\n                            border-top-right-radius: 0;\n                            border-top-left-radius: 0;\n                            border-top: none;\n";
},"22":function(container,depth0,helpers,partials,data) {
    return "                                    <h3 class=\"article-title\" style=\"color: #c59b2f\">(duplicat)</h3>\n";
},"24":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"qrCode") : depth0),{"name":"if","hash":{},"fn":container.program(25, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":82,"column":36},"end":{"line":86,"column":43}}})) != null ? stack1 : "");
},"25":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                        <div class=\"qr-code\" style=\"float: right\">\n                                            <img src=\""
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"qrCode") : depth0), depth0))
    + "\" title=\"scaneaza pt telefon\" width=\"85\"/>\n                                        </div>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div style=\"position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            background: rgba(0,0,0,0.85);\n            z-index: 10000;\n            padding: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":8,"column":21},"end":{"line":8,"column":65}}})) != null ? stack1 : "")
    + ";\n            padding-top: 100px;\n            padding-bottom: 100px;\n            overflow-y: scroll;\n\">\n    <div class=\"rmd-container-search-results\" style=\"width: 100%;\n                                                    max-width: 1000px;\n                                                    padding: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data,"loc":{"start":{"line":15,"column":61},"end":{"line":15,"column":106}}})) != null ? stack1 : "")
    + " !important;\n                                                    background: #ececec;\n                                                    border-radius: 10px;\n                                                    margin: auto;\n                                                    position: relative;\" onclick=\"event.stopPropagation()\">\n        <div style=\"position: absolute; top: -70px; width: 100%; margin-left: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.program(11, data, 0),"data":data,"loc":{"start":{"line":20,"column":78},"end":{"line":20,"column":125}}})) != null ? stack1 : "")
    + ";\">\n            <h2 style=\" font-weight: bold;\n                        color: #edd492;\n                        float: left;\n                        text-shadow: 2px 2px 2px rgba(0, 0, 0, .2);\n                        background: #bd3636;\n                        padding: 5px 20px;\n                        border-radius: 10px;\n                        margin-top: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":28,"column":36},"end":{"line":28,"column":82}}})) != null ? stack1 : "")
    + ";\">\n                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 30\" fill=\"#edd492\" style=\"\n                        vertical-align: middle;\n                        transform: scale(2);\n                    \">\n                    <polygon points=\"12,2 15,10 23,10 17,14 19,22 12,17 5,22 7,14 1,10 9,10\"/>\n                </svg> Favorite\n            </h2>\n            <button type=\"button\" class=\"mainbg radius\" style=\"float: right; border-radius: 1000px; padding: 11px; line-height: 0; background: rgba(255,255,255,0.6)\" data-wwid=\"close\">\n                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\n                    <line x1=\"4\" y1=\"4\" x2=\"20\" y2=\"20\" stroke=\"black\" stroke-width=\"2\"/>\n                    <line x1=\"20\" y1=\"4\" x2=\"4\" y2=\"20\" stroke=\"black\" stroke-width=\"2\"/>\n                </svg>\n            </button>\n            <button type=\"button\" class=\"radius\" style=\"color: black;float: right;line-height: 0;background: rgba(255,255,255,0.6);\n                                                        margin-right: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(15, data, 0),"inverse":container.program(17, data, 0),"data":data,"loc":{"start":{"line":43,"column":70},"end":{"line":43,"column":115}}})) != null ? stack1 : "")
    + ";padding: 13px;\" data-wwid=\"clear-favorites\">\n                <b>șterge lista</b>\n            </button>\n        </div>\n\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"itemData") : depth0),{"name":"each","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":48,"column":8},"end":{"line":93,"column":17}}})) != null ? stack1 : "")
    + "    </div>\n</div>\n";
},"useData":true});
templates['saves_button_template'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "115px";
},"3":function(container,depth0,helpers,partials,data) {
    return "80px";
},"5":function(container,depth0,helpers,partials,data) {
    return "            right: 10px;\n            padding-left: 36px;\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "            left: 50%;\n            transform: translateX(-50%);\n            min-width: 180px;\n";
},"9":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return container.escapeExpression(((helper = (helper = lookupProperty(helpers,"count") || (depth0 != null ? lookupProperty(depth0,"count") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"count","hash":{},"data":data,"loc":{"start":{"line":33,"column":34},"end":{"line":33,"column":43}}}) : helper)));
},"11":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Favorite ("
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"count") || (depth0 != null ? lookupProperty(depth0,"count") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"count","hash":{},"data":data,"loc":{"start":{"line":33,"column":61},"end":{"line":33,"column":70}}}) : helper)))
    + ")";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<style>\n    .ww-saves-button {\n        position: fixed;\n        bottom: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":4,"column":16},"end":{"line":4,"column":63}}})) != null ? stack1 : "")
    + ";\n        padding: 12px;\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data,"loc":{"start":{"line":6,"column":8},"end":{"line":13,"column":15}}})) != null ? stack1 : "")
    + "        font-weight: bold;\n        background: #cb2727;\n        border-radius: 6px;\n        border: 1px solid white;\n        box-shadow: 1px 1px 4px 2px rgba(0, 0, 0, .2);\n    }\n    .ww-saves-button:hover {\n        background: #df4a4a;\n    }\n</style>\n\n<button class=\"ww-saves-button\">\n    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 30\" fill=\"white\" style=\"\n        vertical-align: middle;\n        position: absolute;\n        transform: scale(1.4);\n        left: 12px;\n    \">\n        <polygon points=\"12,2 15,10 23,10 17,14 19,22 12,17 5,22 7,14 1,10 9,10\"/>\n    </svg> "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"IS_MOBILE_VIEW") : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.program(11, data, 0),"data":data,"loc":{"start":{"line":33,"column":11},"end":{"line":33,"column":78}}})) != null ? stack1 : "")
    + "\n</button>\n";
},"useData":true});
templates['slider_template'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "                <li class=\"splide__slide\">\n                    <img onclick=\"event.stopPropagation()\" style='max-width: 100%;\n                                max-height: 100%;\n                                display: block;\n                                margin: auto;\n                                box-shadow: 5px 5px 15px 3px rgba(0,0,0,.3);\n                                border-radius: 5px;\n                                ' src=\""
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "\"/>\n                </li>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div style=\"position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            background: rgba(0,0,0,0.85);\n            z-index: 10000;\n            padding: 30px;\n            padding-bottom: 100px;\n\">\n    <div style=\"position: absolute; left: 50%; bottom: 30px; transform: translate(-50%, 0)\">\n        <button type=\"button\" style=\"vertical-align: middle; background-color: #c59b2f; padding: 9px; padding-bottom: 7px; position: absolute; right: 70px;\" class=\"mainbg radius\" data-wwid=\"toggle-hidden\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FFF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle></svg>\n        </button>\n        <button type=\"button\" style=\"position: absolute; left: 70px; vertical-align: middle; padding: 9px; padding-bottom: 7px;\" class=\"mainbg radius\" data-wwid=\"analyze-images\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FFF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><path d=\"M20.4 14.5L16 10 4 20\"/></svg>\n        </button>\n        <button type=\"button\" class=\"mainbg radius\" style=\"border-radius: 1000px; padding: 11px; line-height: 0; background: rgba(255,255,255,0.6)\" data-wwid=\"close\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\n                <line x1=\"4\" y1=\"4\" x2=\"20\" y2=\"20\" stroke=\"black\" stroke-width=\"2\"/>\n                <line x1=\"20\" y1=\"4\" x2=\"4\" y2=\"20\" stroke=\"black\" stroke-width=\"2\"/>\n            </svg>\n        </button>\n    </div>\n    <section class=\"splide\" style=\"height: 100%\">\n        <style>.splide__track {height: 100%} .splide__track {overflow-y: visible !important;}</style>\n        <div class=\"splide__track\">\n            <ul class=\"splide__list\" style=\"height: 100%\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"images") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":29,"column":16},"end":{"line":39,"column":25}}})) != null ? stack1 : "")
    + "            </ul>\n        </div>\n    </section>\n</div>\n";
},"useData":true});
})();