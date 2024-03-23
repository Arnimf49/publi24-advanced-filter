(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['template'] = template({"1":function(container,depth0,helpers,partials,data) {
    return ";display:none;";
},"3":function(container,depth0,helpers,partials,data) {
    return " style=\"display:none;\" ";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <div onclick=\"event.stopPropagation()\">\n      <h4>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"phone") || (depth0 != null ? lookupProperty(depth0,"phone") : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"phone","hash":{},"data":data,"loc":{"start":{"line":7,"column":10},"end":{"line":7,"column":19}}}) : helper)))
    + "</h4>\n      <h5 style=\"margin-top: 5px; font-size: 1.125rem\">Rezultate după telefon</h5>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(lookupProperty(helpers,"isUndefined")||(depth0 && lookupProperty(depth0,"isUndefined"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"searchLinks") : depth0),{"name":"isUndefined","hash":{},"data":data,"loc":{"start":{"line":9,"column":12},"end":{"line":9,"column":37}}}),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.program(8, data, 0),"data":data,"loc":{"start":{"line":9,"column":6},"end":{"line":19,"column":13}}})) != null ? stack1 : "")
    + "\n      <h5 style=\"margin-top: 5px; font-size: 1.125rem\">Rezultate după imagine</h5>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(lookupProperty(helpers,"isUndefined")||(depth0 && lookupProperty(depth0,"isUndefined"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"imageSearchLinks") : depth0),{"name":"isUndefined","hash":{},"data":data,"loc":{"start":{"line":22,"column":12},"end":{"line":22,"column":42}}}),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.program(14, data, 0),"data":data,"loc":{"start":{"line":22,"column":6},"end":{"line":32,"column":13}}})) != null ? stack1 : "")
    + "    </div>\n";
},"6":function(container,depth0,helpers,partials,data) {
    return "        <p style=\"color: rgb(34, 34, 34); font-size: .8125rem;\">nerulat</p>\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"filteredSearchLinks") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),{"name":"unless","hash":{},"fn":container.program(9, data, 0),"inverse":container.program(11, data, 0),"data":data,"loc":{"start":{"line":12,"column":8},"end":{"line":18,"column":19}}})) != null ? stack1 : "");
},"9":function(container,depth0,helpers,partials,data) {
    return "          <p style=\"color: rgb(34, 34, 34); font-size: .8125rem;\">nu au fost găsite linkuri</p>\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"filteredSearchLinks") : depth0),{"name":"each","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":10},"end":{"line":17,"column":19}}})) != null ? stack1 : "");
},"12":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "            <div style=\"font-size: .8125rem;\"><a onclick='event.stopPropagation()' href=\""
    + alias2(alias1(depth0, depth0))
    + "\" target=\"_blank\">"
    + alias2(alias1(depth0, depth0))
    + "</a></div>\n";
},"14":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"filteredImageSearchLinks") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),{"name":"unless","hash":{},"fn":container.program(9, data, 0),"inverse":container.program(15, data, 0),"data":data,"loc":{"start":{"line":25,"column":8},"end":{"line":31,"column":19}}})) != null ? stack1 : "");
},"15":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"filteredImageSearchLinks") : depth0),{"name":"each","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":28,"column":10},"end":{"line":30,"column":19}}})) != null ? stack1 : "");
},"17":function(container,depth0,helpers,partials,data) {
    return "    <span>neanalizat</span>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<hr style=\"opacity: 0.02\"/>\n  <button type=\"button\" class=\"mainbg radius\" data-wwid=\"investigate\">Analizare telefon</button>\n  <button type=\"button\" style=\"background-color: #c59b2f"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(depth0 != null ? lookupProperty(depth0,"searchLinks") : depth0),{"name":"unless","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":56},"end":{"line":3,"column":104}}})) != null ? stack1 : "")
    + "\" class=\"mainbg radius\" data-wwid=\"toggle-hidden\">Ascunde</button>\n  <button type=\"button\" "
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(depth0 != null ? lookupProperty(depth0,"searchLinks") : depth0),{"name":"unless","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":24},"end":{"line":4,"column":81}}})) != null ? stack1 : "")
    + " class=\"mainbg radius\" data-wwid=\"investigate_img\">Analizare imagine</button>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"searchLinks") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(17, data, 0),"data":data,"loc":{"start":{"line":5,"column":2},"end":{"line":36,"column":9}}})) != null ? stack1 : "");
},"useData":true});
})();