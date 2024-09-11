(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
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
templates['template'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "    <span>anuntul nu are nr telefon;</span>\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "style=\"display:none;\" ";
},"5":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <a href='"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"nimfomaneLink") || (depth0 != null ? lookupProperty(depth0,"nimfomaneLink") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"nimfomaneLink","hash":{},"data":data,"loc":{"start":{"line":11,"column":13},"end":{"line":11,"column":30}}}) : helper)))
    + "' target='_blank' style='position: relative'>\n        <svg\n                style='position: absolute;\n               width: 20px;\n               height: 20px;\n               margin-top: 2px;\n               margin-left: 2px;'\n                xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\">\n            <polygon fill='#17c160' points=\"2.67 7.63 5.46 10.41 13.33 2.54 14.85 4.06 5.46 13.46 1.15 9.15 2.67 7.63\"/>\n        </svg>\n        <img style='background: #2f4979;\n                  height: 45px;\n                  border-radius: 4px;\n                  padding: 12px;'\n             src='https://nimfomane.com/forum/uploads/monthly_2024_01/logo2.png.d461ead015b3eddf20bc0a9b70668583.png'/>\n    </a>\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "    <div style=\"margin-top: 5px\">\n        <p style=\"color: rgb(34, 34, 34); font-size: .8125rem;\">acest nr de telefon deja a fost marcat ascuns de la alt anunț</p>\n    </div>\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"searchLinks") : depth0),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.program(22, data, 0),"data":data,"loc":{"start":{"line":36,"column":4},"end":{"line":69,"column":11}}})) != null ? stack1 : "");
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <div>\n            <h4 style='font-weight: bold; padding-top: 10px;'>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"phone") || (depth0 != null ? lookupProperty(depth0,"phone") : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"phone","hash":{},"data":data,"loc":{"start":{"line":38,"column":62},"end":{"line":38,"column":71}}}) : helper)))
    + "</h4>\n            <h5 style=\"margin-top: 5px; font-size: 1.125rem\">Rezultate după telefon</h5>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(lookupProperty(helpers,"isUndefined")||(depth0 && lookupProperty(depth0,"isUndefined"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"searchLinks") : depth0),{"name":"isUndefined","hash":{},"data":data,"loc":{"start":{"line":40,"column":18},"end":{"line":40,"column":43}}}),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.program(13, data, 0),"data":data,"loc":{"start":{"line":40,"column":12},"end":{"line":51,"column":19}}})) != null ? stack1 : "")
    + "\n            <h5 style=\"margin-top: 5px; font-size: 1.125rem\">Rezultate după imagine</h5>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(lookupProperty(helpers,"isUndefined")||(depth0 && lookupProperty(depth0,"isUndefined"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"imageSearchLinks") : depth0),{"name":"isUndefined","hash":{},"data":data,"loc":{"start":{"line":54,"column":18},"end":{"line":54,"column":48}}}),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.program(19, data, 0),"data":data,"loc":{"start":{"line":54,"column":12},"end":{"line":65,"column":19}}})) != null ? stack1 : "")
    + "        </div>\n";
},"11":function(container,depth0,helpers,partials,data) {
    return "                <p style=\"color: rgb(34, 34, 34); font-size: .8125rem;\">nerulat</p>\n";
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"filteredSearchLinks") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),{"name":"unless","hash":{},"fn":container.program(14, data, 0),"inverse":container.program(16, data, 0),"data":data,"loc":{"start":{"line":43,"column":16},"end":{"line":50,"column":27}}})) != null ? stack1 : "");
},"14":function(container,depth0,helpers,partials,data) {
    return "                    <p style=\"color: rgb(123 91 91); font-size: .8125rem;\">nu au fost găsite linkuri relevante</p>\n";
},"16":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"filteredSearchLinks") : depth0),{"name":"each","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":46,"column":20},"end":{"line":49,"column":29}}})) != null ? stack1 : "");
},"17":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "                        <div style=\"font-size: .8125rem; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;\">\n                            <a onclick='event.stopPropagation()' href=\""
    + alias2(alias1(depth0, depth0))
    + "\" target=\"_blank\">"
    + alias2(alias1(depth0, depth0))
    + "</a></div>\n";
},"19":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"filteredImageSearchLinks") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),{"name":"unless","hash":{},"fn":container.program(14, data, 0),"inverse":container.program(20, data, 0),"data":data,"loc":{"start":{"line":57,"column":16},"end":{"line":64,"column":27}}})) != null ? stack1 : "");
},"20":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"filteredImageSearchLinks") : depth0),{"name":"each","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":60,"column":20},"end":{"line":63,"column":29}}})) != null ? stack1 : "");
},"22":function(container,depth0,helpers,partials,data) {
    return "        <span>neanalizat</span>\n";
},"24":function(container,depth0,helpers,partials,data) {
    return "\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<hr style=\"opacity: 0.02\"/>\n<button type=\"button\" style=\"background-color: #c59b2f\" class=\"mainbg radius\" data-wwid=\"toggle-hidden\">Ascunde</button>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"hasNoPhone") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":5,"column":7}}})) != null ? stack1 : "")
    + "<button type=\"button\" "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"hasNoPhone") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":22},"end":{"line":6,"column":69}}})) != null ? stack1 : "")
    + " class=\"mainbg radius\" data-wwid=\"investigate\">Analiza telefon</button>\n<button type=\"button\" "
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(depth0 != null ? lookupProperty(depth0,"searchLinks") : depth0),{"name":"unless","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":22},"end":{"line":7,"column":78}}})) != null ? stack1 : "")
    + " class=\"mainbg radius\" data-wwid=\"investigate_img\">Analiza imagine\n</button>\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"nimfomaneLink") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":0},"end":{"line":27,"column":7}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"dueToPhoneHidden") : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":29,"column":0},"end":{"line":33,"column":7}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"visible") : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.program(24, data, 0),"data":data,"loc":{"start":{"line":35,"column":0},"end":{"line":72,"column":7}}})) != null ? stack1 : "");
},"useData":true});
})();