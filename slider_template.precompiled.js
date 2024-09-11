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
})();