(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['ad_template'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "#cb2727";
},"3":function(container,depth0,helpers,partials,data) {
    return "none";
},"5":function(container,depth0,helpers,partials,data) {
    return "#333";
},"7":function(container,depth0,helpers,partials,data) {
    return "    <span>anuntul nu are nr telefon;</span>\n";
},"9":function(container,depth0,helpers,partials,data) {
    return "style=\"display:none;\" ";
},"11":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <a href='"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"nimfomaneLink") || (depth0 != null ? lookupProperty(depth0,"nimfomaneLink") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"nimfomaneLink","hash":{},"data":data,"loc":{"start":{"line":19,"column":13},"end":{"line":19,"column":30}}}) : helper)))
    + "' target='_blank' style='position: relative'>\n        <svg\n                style='position: absolute;\n               width: 20px;\n               height: 20px;\n               margin-top: 2px;\n               margin-left: 2px;'\n                xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\">\n            <polygon fill='#8fc38f' points=\"2.67 7.63 5.46 10.41 13.33 2.54 14.85 4.06 5.46 13.46 1.15 9.15 2.67 7.63\"/>\n        </svg>\n        <img style='background: #2f4979;\n                  height: 45px;\n                  border-radius: 4px;\n                  padding: 12px;'\n             src='https://nimfomane.com/forum/uploads/monthly_2024_01/logo2.png.d461ead015b3eddf20bc0a9b70668583.png'/>\n    </a>\n";
},"13":function(container,depth0,helpers,partials,data) {
    return "    <div style=\"margin-top: 5px\">\n        <p style=\"color: rgb(34, 34, 34); font-size: .8125rem;\">acest nr de telefon deja a fost marcat ascuns de la alt anunț</p>\n    </div>\n";
},"15":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"searchLinks") : depth0),{"name":"if","hash":{},"fn":container.program(16, data, 0, blockParams, depths),"inverse":container.program(37, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":44,"column":4},"end":{"line":95,"column":11}}})) != null ? stack1 : "");
},"16":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <div>\n            <h4 style='font-weight: bold; padding-top: 10px;'>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"phone") || (depth0 != null ? lookupProperty(depth0,"phone") : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"phone","hash":{},"data":data,"loc":{"start":{"line":46,"column":62},"end":{"line":46,"column":71}}}) : helper)))
    + "</h4>\n            <h5 style=\"margin-top: 5px; margin-bottom: 3px; font-size: 1.125rem\">Rezultate după telefon</h5>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(lookupProperty(helpers,"isUndefined")||(depth0 && lookupProperty(depth0,"isUndefined"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"searchLinks") : depth0),{"name":"isUndefined","hash":{},"data":data,"loc":{"start":{"line":48,"column":18},"end":{"line":48,"column":43}}}),{"name":"if","hash":{},"fn":container.program(17, data, 0, blockParams, depths),"inverse":container.program(19, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":48,"column":12},"end":{"line":59,"column":19}}})) != null ? stack1 : "")
    + "\n            <h5 style=\"margin-top: 5px; margin-bottom: 3px; font-size: 1.125rem\">Rezultate dupa imagine</h5>\n"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"imageSearchDomains") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),{"name":"unless","hash":{},"fn":container.program(17, data, 0, blockParams, depths),"inverse":container.program(25, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":62,"column":12},"end":{"line":91,"column":23}}})) != null ? stack1 : "")
    + "        </div>\n";
},"17":function(container,depth0,helpers,partials,data) {
    return "                <p style=\"color: rgb(34, 34, 34); font-size: .8125rem;\">nerulat</p>\n";
},"19":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"filteredSearchLinks") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),{"name":"unless","hash":{},"fn":container.program(20, data, 0),"inverse":container.program(22, data, 0),"data":data,"loc":{"start":{"line":51,"column":16},"end":{"line":58,"column":27}}})) != null ? stack1 : "");
},"20":function(container,depth0,helpers,partials,data) {
    return "                    <p style=\"color: rgb(103,109,92); font-size: .8125rem;\">nu au fost găsite linkuri relevante</p>\n";
},"22":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"filteredSearchLinks") : depth0),{"name":"each","hash":{},"fn":container.program(23, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":54,"column":20},"end":{"line":57,"column":29}}})) != null ? stack1 : "");
},"23":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "                        <div style=\"font-size: .8125rem; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;\">\n                            <a onclick='event.stopPropagation()' href=\""
    + alias2(alias1(depth0, depth0))
    + "\" target=\"_blank\">"
    + alias2(alias1(depth0, depth0))
    + "</a></div>\n";
},"25":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"imageSearchDomains") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),{"name":"unless","hash":{},"fn":container.program(20, data, 0, blockParams, depths),"inverse":container.program(26, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":65,"column":16},"end":{"line":90,"column":27}}})) != null ? stack1 : "");
},"26":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <div style=\"font-size: .8125rem;\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"imageSearchDomains") : depth0),{"name":"each","hash":{},"fn":container.program(27, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":69,"column":24},"end":{"line":88,"column":33}}})) != null ? stack1 : "")
    + "                    </div>\n";
},"27":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"links") : depth0),{"name":"each","hash":{},"fn":container.program(28, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":70,"column":28},"end":{"line":87,"column":37}}})) != null ? stack1 : "");
},"28":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                <a href=\""
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "\" target=\"_blank\"\n                                   style=\"display: inline-block;\n                                           background-color: "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depths[1] != null ? lookupProperty(depths[1],"isSafe") : depths[1]),{"name":"if","hash":{},"fn":container.program(29, data, 0, blockParams, depths),"inverse":container.program(31, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":73,"column":61},"end":{"line":73,"column":107}}})) != null ? stack1 : "")
    + ";\n                                           padding: 5px;\n                                           margin-right: 3px;\n                                           margin-bottom: 6px;\n                                           border-radius: 5px;\n                                           text-decoration: none;\n                                           color: rgb(55 55 55);\n                               \">\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(data && lookupProperty(data,"first")),{"name":"if","hash":{},"fn":container.program(33, data, 0, blockParams, depths),"inverse":container.program(35, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":81,"column":36},"end":{"line":85,"column":43}}})) != null ? stack1 : "")
    + "                                </a>\n";
},"29":function(container,depth0,helpers,partials,data) {
    return "#d1e1d1";
},"31":function(container,depth0,helpers,partials,data) {
    return "#efe2e2";
},"33":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                        "
    + container.escapeExpression(container.lambda((depths[1] != null ? lookupProperty(depths[1],"domain") : depths[1]), depth0))
    + "\n";
},"35":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                        <span style=\"font-size: .6rem\">#</span>"
    + container.escapeExpression((lookupProperty(helpers,"inc")||(depth0 && lookupProperty(depth0,"inc"))||container.hooks.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),(data && lookupProperty(data,"index")),{"name":"inc","hash":{},"data":data,"loc":{"start":{"line":84,"column":79},"end":{"line":84,"column":93}}}))
    + "\n";
},"37":function(container,depth0,helpers,partials,data) {
    return "        <span>neanalizat</span>\n";
},"39":function(container,depth0,helpers,partials,data) {
    return "\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<hr style=\"opacity: 0.02\"/>\n<button type=\"button\" style=\"background-color: #c59b2f\" class=\"mainbg radius\" data-wwid=\"toggle-hidden\">Ascunde</button>\n\n<button style=\"vertical-align: middle; padding: 9px\" data-wwid=\"temp-save\">\n    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"\n         fill=\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isTempSaved") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.program(3, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":6,"column":15},"end":{"line":6,"column":60}}})) != null ? stack1 : "")
    + "\"\n         stroke=\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isTempSaved") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.program(5, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":7,"column":17},"end":{"line":7,"column":59}}})) != null ? stack1 : "")
    + "\" stroke-width=\"1\">\n        <polygon points=\"12,2 15,10 23,10 17,14 19,22 12,17 5,22 7,14 1,10 9,10\"/>\n    </svg>\n</button>\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"hasNoPhone") : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":0},"end":{"line":14,"column":7}}})) != null ? stack1 : "")
    + "<button type=\"button\" "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"hasNoPhone") : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":22},"end":{"line":15,"column":69}}})) != null ? stack1 : "")
    + " class=\"mainbg radius\" data-wwid=\"investigate\">Analiza telefon</button>\n<button type=\"button\" "
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(depth0 != null ? lookupProperty(depth0,"searchLinks") : depth0),{"name":"unless","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":22},"end":{"line":16,"column":78}}})) != null ? stack1 : "")
    + " class=\"mainbg radius\" data-wwid=\"investigate_img\">Analiza imagine</button>\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"nimfomaneLink") : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":18,"column":0},"end":{"line":35,"column":7}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"dueToPhoneHidden") : depth0),{"name":"if","hash":{},"fn":container.program(13, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":37,"column":0},"end":{"line":41,"column":7}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"visible") : depth0),{"name":"if","hash":{},"fn":container.program(15, data, 0, blockParams, depths),"inverse":container.program(39, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":43,"column":0},"end":{"line":98,"column":7}}})) != null ? stack1 : "");
},"useData":true,"useDepths":true});
templates['ads_template'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <div class=\"article-item\" data-articleid=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"id") : depth0), depth0))
    + "\"\n                 style=\"margin-bottom: 30px;\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,(depth0 != null ? lookupProperty(depth0,"duplicate") : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":44,"column":24},"end":{"line":49,"column":31}}})) != null ? stack1 : "")
    + "                        \"\n                 onclick=\"window.open('"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"url") : depth0), depth0))
    + "', '_blank')\"\n            >\n                <div class=\"article-txt-wrap\">\n                    <div class=\"article-txt\" style=\"padding-right: 20px\">\n                        <div class=\"article-content-wrap\" style=\"overflow: visible\">\n                            <div class=\"art-img\">\n                                <a><img src=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"image") : depth0), depth0))
    + "\" width=\"200\" height=\"200\"/></a>\n                            </div>\n\n                            <div class=\"article-content\">\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,(depth0 != null ? lookupProperty(depth0,"duplicate") : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":61,"column":32},"end":{"line":63,"column":39}}})) != null ? stack1 : "")
    + "                                <h2 class=\"article-title\"><a href=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"url") : depth0), depth0))
    + "\" target=\"_blank\">"
    + alias2(((helper = (helper = lookupProperty(helpers,"title") || (depth0 != null ? lookupProperty(depth0,"title") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias3,{"name":"title","hash":{},"data":data,"loc":{"start":{"line":64,"column":97},"end":{"line":64,"column":106}}}) : helper)))
    + "</a></h2>\n                                <p style=\"display: block\" class=\"article-description\">"
    + ((stack1 = alias1((depth0 != null ? lookupProperty(depth0,"description") : depth0), depth0)) != null ? stack1 : "")
    + "</p>\n\n                                <p class=\"article-location\" style=\"float: left\">\n                                    <i class=\"svg-icon svg-icon-article\">\n                                        <svg viewBox=\"0 0 50 50\" aria-hidden=\"true\"><use xlink:href=\"#svg-icon-location\"></use></svg>\n                                    </i>\n                                    <span>"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"location") : depth0), depth0))
    + "</span>\n                                </p>\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,(depth0 != null ? lookupProperty(depth0,"qrCode") : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":74,"column":32},"end":{"line":78,"column":39}}})) != null ? stack1 : "")
    + "                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "                            margin-top: -35px;\n                            border-top-right-radius: 0;\n                            border-top-left-radius: 0;\n                            border-top: none;\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "                                    <h3 class=\"article-title\" style=\"color: #c59b2f\">(duplicat)</h3>\n";
},"6":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                    <div class=\"qr-code\" style=\"float: right\">\n                                        <img src=\""
    + container.escapeExpression(container.lambda((depth0 != null ? lookupProperty(depth0,"qrCode") : depth0), depth0))
    + "\" title=\"scaneaza pt telefon\" width=\"85\"/>\n                                    </div>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div style=\"position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            background: rgba(0,0,0,0.85);\n            z-index: 10000;\n            padding: 30px;\n            padding-top: 100px;\n            padding-bottom: 100px;\n            overflow-y: scroll;\n\">\n    <div class=\"rmd-container-search-results\" style=\"width: 100%; max-width: 1000px; padding: 20px !important; background: #ececec; border-radius: 10px; margin: auto; position: relative;\" onclick=\"event.stopPropagation()\">\n        <div style=\"position: absolute; top: -70px; width: 100%; margin-left: -20px;\">\n            <h2 style=\" font-weight: bold;\n                        color: #edd492;\n                        float: left;\n                        text-shadow: 2px 2px 2px rgba(0, 0, 0, .2);\n                        background: #bd3636;\n                        padding: 5px 20px;\n                        border-radius: 10px;\n                        margin-top: -10px;\">\n                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 30\" fill=\"#edd492\" style=\"\n                        vertical-align: middle;\n                        transform: scale(2);\n                    \">\n                    <polygon points=\"12,2 15,10 23,10 17,14 19,22 12,17 5,22 7,14 1,10 9,10\"/>\n                </svg> Favorite\n            </h2>\n            <button type=\"button\" class=\"mainbg radius\" style=\"float: right; border-radius: 1000px; padding: 11px; line-height: 0; background: rgba(255,255,255,0.6)\" data-wwid=\"close\">\n                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\n                    <line x1=\"4\" y1=\"4\" x2=\"20\" y2=\"20\" stroke=\"black\" stroke-width=\"2\"/>\n                    <line x1=\"20\" y1=\"4\" x2=\"4\" y2=\"20\" stroke=\"black\" stroke-width=\"2\"/>\n                </svg>\n            </button>\n            <button type=\"button\" class=\"radius\" style=\"color: black;float: right;line-height: 0;background: rgba(255,255,255,0.6);margin-right: 25px;padding: 13px;\" data-wwid=\"clear-favorites\">\n                <b>șterge lista</b>\n            </button>\n        </div>\n\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"itemData") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":41,"column":8},"end":{"line":84,"column":17}}})) != null ? stack1 : "")
    + "    </div>\n</div>\n";
},"useData":true});
templates['saves_button_template'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<style>\n    .ww-saves-button {\n        position: fixed;\n        bottom: 80px;\n        left: 50%;\n        transform: translateX(-50%);\n        min-width: 180px;\n        font-weight: bold;\n        background: #cb2727;\n        border-radius: 6px;\n        border: 1px solid white;\n        padding: 12px;\n        box-shadow: 1px 1px 4px 2px rgba(0, 0, 0, .2);\n    }\n    .ww-saves-button:hover {\n        background: #df4a4a;\n    }\n</style>\n\n<button class=\"ww-saves-button\">\n    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 30\" fill=\"white\" style=\"\n        vertical-align: middle;\n        position: absolute;\n        transform: scale(1.4);\n        left: 12px;\n    \">\n        <polygon points=\"12,2 15,10 23,10 17,14 19,22 12,17 5,22 7,14 1,10 9,10\"/>\n    </svg> Favorite ("
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"count") || (depth0 != null ? lookupProperty(depth0,"count") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"count","hash":{},"data":data,"loc":{"start":{"line":28,"column":21},"end":{"line":28,"column":30}}}) : helper)))
    + ")\n</button>\n";
},"useData":true});
templates['slider_template'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "Ascunde";
},"3":function(container,depth0,helpers,partials,data) {
    return "Arată";
},"5":function(container,depth0,helpers,partials,data) {
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

  return "<div style=\"position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            background: rgba(0,0,0,0.85);\n            z-index: 10000;\n            padding: 30px;\n            padding-top: 100px;\n\">\n    <div style=\"position: absolute; left: 50%; top: 30px; transform: translate(-50%, 0)\">\n        <button type=\"button\" style=\"background-color: #c59b2f; position: absolute; right: 70px; min-width: 130px;\" class=\"mainbg radius\" data-wwid=\"toggle-hidden\">\n            "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"visible") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":13,"column":12},"end":{"line":13,"column":54}}})) != null ? stack1 : "")
    + "\n        </button>\n        <button type=\"button\" style=\"position: absolute; left: 70px; min-width: 130px;\" class=\"mainbg radius\" data-wwid=\"analyze-images\">Analiza imagini</button>\n        <button type=\"button\" class=\"mainbg radius\" style=\"border-radius: 1000px; padding: 11px; line-height: 0; background: rgba(255,255,255,0.6)\" data-wwid=\"close\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\n                <line x1=\"4\" y1=\"4\" x2=\"20\" y2=\"20\" stroke=\"black\" stroke-width=\"2\"/>\n                <line x1=\"20\" y1=\"4\" x2=\"4\" y2=\"20\" stroke=\"black\" stroke-width=\"2\"/>\n            </svg>\n        </button>\n    </div>\n    <section class=\"splide\" style=\"height: 100%\">\n        <style>.splide__track {height: 100%} .splide__track {overflow-y: visible !important;}</style>\n        <div class=\"splide__track\">\n            <ul class=\"splide__list\" style=\"height: 100%\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"images") : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":27,"column":16},"end":{"line":37,"column":25}}})) != null ? stack1 : "")
    + "            </ul>\n        </div>\n    </section>\n</div>\n";
},"useData":true});
})();