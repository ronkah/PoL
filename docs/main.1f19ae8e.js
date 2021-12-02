// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"main.js":[function(require,module,exports) {
'use strict';

var graphColor = ['#0E1766', '#710BC2', '#F63AAC', '#d281d2', '#7aa0cb', '#d281d2', '#000000', '#F6EBFF'];
var $tableID = $('#maintable-table');
$tableID.on('click', '.table-remove', function () {
  $(this).parents('tr').detach();
});
$tableID.on('click', '.table-up', function () {
  var $row = $(this).parents('tr');

  if ($row.index() === 0) {
    return;
  }

  $row.prev().before($row.get(0));
});
$(document).on("keyup", '#maintable-table tr td', function (e) {
  // $('#maintable-table tr td').on("keydown", function(){
  var row = $(this).parents('tr');
  var userId = row.children('.user-id').text().toLowerCase();
  var amount = row.children('.user-amount').text();
  var digest = sha256(userId + amount); // console.log('userId: ' + userId + ' amount: ' + amount + '. sha256(' + userId + amount +') = ' + digest);  

  row.children('.user-commitment').text(digest);
});
$tableID.on('click', '.table-down', function () {
  var $row = $(this).parents('tr');
  $row.next().after($row.get(0));
});
$("#btn-add-user").click(function () {
  var toAppend = '<tr>';
  toAppend += '<td class="pt-3-half user-id" contenteditable="true">user_id</td>';
  toAppend += '<td class="pt-3-half user-amount" contenteditable="true">0</td>';
  toAppend += '<td class="pt-3-half user-commitment">commitment</td>';
  toAppend += '<td><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0">Remove</button></span></td>';
  toAppend += '</tr>';
  $("#users_table").append(toAppend);
});
$("#nav-tree-tab").click(function () {
  // table to array object
  var convertedIntoArray = [];
  $("table#users_table tbody tr").each(function () {
    var rowData = {};
    var actualData = $(this).find('td');

    if (actualData.length > 0) {
      actualData.each(function () {
        if ($(this).hasClass("user-id")) {
          rowData.userId = $(this).text();
        } else if ($(this).hasClass("user-amount")) {
          rowData.amount = Number($(this).text());
        } else if ($(this).hasClass("user-commitment")) {
          rowData.commitment = $(this).text();
        }
      });
      convertedIntoArray.push(rowData);
    }
  });
  var treeArr = buildTree(convertedIntoArray);
  updateVerifyPage(convertedIntoArray, treeArr);
  var diagramData = treeArrToTreeData(treeArr);
  buildDiagram(diagramData, "merkle-graph", "graph", true);
  buildDiagram(diagramData, "merkle-graph-verifer", "graph-b", false);
});

function updateVerifyPage(convertedIntoArray, treeArr) {
  fillVerifyUserSelect(convertedIntoArray);
  updateVerficationRootValue(treeArr[0].commitment);
}

function fillVerifyUserSelect(usersArr) {
  var select = document.getElementById("user-verify-select");
  var i,
      L = select.options.length - 1;

  for (i = L; i >= 0; i--) {
    select.remove(i);
  }

  var el = document.createElement("option");
  el.textContent = "Choose a User";
  el.value = "";
  el.hidden = true;
  el.disabled = true;
  el.selected = true;
  select.appendChild(el);

  for (var i = 0; i < usersArr.length; i++) {
    var opt = usersArr[i].userId;
    el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    select.appendChild(el);
  }
}

function updateVerficationRootValue(rootCommitment) {
  $('#published-root-text').text(rootCommitment);
} // function shortHash(hash) {
//   let trimmedHash = hash.trim();
//   let first = trimmedHash.substring(0,3);
//   let last = trimmedHash.substring(trimmedHash.length - 3);
//   let res = first + '...' + last;
//   return res;
// }
// $("#nav-tree-tab").click(function () {
//   // table to array object
//   var convertedIntoArray = [];
//   $("table#users_table tbody tr").each(function () {
//     var rowData = {};
//     var actualData = $(this).find('td');
//     if (actualData.length > 0) {
//       actualData.each(function () {
//         if ($(this).hasClass("user-id")) {
//           rowData.userId = $(this).text();
//         } else if ($(this).hasClass("user-amount")) {
//           rowData.amount = Number($(this).text());
//         } else if ($(this).hasClass("user-commitment")) {
//           rowData.commitment = $(this).text();
//         }
//       });
//       convertedIntoArray.push(rowData);
//     }
//   });
//   let treeArr = buildTree(convertedIntoArray);
//   let diagramData = treeArrToTreeData(treeArr);
//   buildDiagram(diagramData);
// });
// function treeArrToTreeData(array) {
//   let level = 0;
//   let idx = 1;
//   let res = { name: "Balance " + array[idx - 1].amount, fill: graphColor[level], subname: shortHash(array[level].commitment) }
//   res.children = [];
//   // left child
//   let left = recursivee(idx + 1, level + 1, array);
//   if (left) {
//     res.children.push(left);
//   }
//   // right child
//   let right = recursivee(idx + 2, level + 1, array);
//   if (right) {
//     res.children.push(right);
//   }
//   return res;
// }
// function recursivee(idx, level, array) {
//   if (idx > array.length) {
//     return ""
//   }
//   let res = { name: "Balance " + array[idx - 1].amount, fill: graphColor[level], subname: shortHash(array[idx - 1].commitment) }
//   res.children = [];
//   // left child
//   let left = recursivee(idx * 2, level+1, array);
//   if (left) {
//     res.children.push(left);
//   }
//   // right child
//   let right = recursivee((idx * 2) + 1, level+1, array);
//   if (right) {
//     res.children.push(right);
//   }
//   return res
// }
// function buildTree(records) {
//   // build leaf level 
//   let leafLevelLength = 1;
//   for (; leafLevelLength < records.length; leafLevelLength = leafLevelLength * 2) { }
//   let leafLevel = [];
//   for (let i = 0; i < leafLevelLength; i++) {
//     if (i < records.length) {
//       leafLevel.push({ commitment: records[i].commitment, amount: records[i].amount });
//     } else {
//       leafLevel.push({ commitment: sha256(""), amount: 0 });
//     }
//   }
//   let levels = [];
//   levels.push(leafLevel);
//   let currLevel = leafLevel
//   for (; currLevel.length > 1;) {
//     let nextLevel = [];
//     for (let i = 1; i < currLevel.length; i = i + 2) {
//       let nextItem = { commitment: sha256(currLevel[i - 1].commitment + currLevel[i].commitment), amount: currLevel[i - 1].amount + currLevel[i].amount }
//       nextLevel.push(nextItem);
//     }
//     levels.push(nextLevel);
//     currLevel = nextLevel;
//   }
//   let res = [];
//   for (let i = levels.length; i >= 0; i--) {
//     res.push.apply(res, levels[i])
//   }
//   return res;
// }
// function buildDiagram(treeData) {
//   // clean all children of element
//   const myNode = document.getElementById("merkle-graph");
//   myNode.innerHTML = '';
//   // Set the dimensions and margins of the diagram
//   var margin = { top: 20, right: 90, bottom: 30, left: 90 },
//     width = 960 - margin.left - margin.right,
//     height = 500 - margin.top - margin.bottom;
//   // append the svg object to the body of the page
//   // appends a 'group' element to 'svg'
//   // moves the 'group' element to the top left margin
//   var svg = d3.select("graph").append("svg")
//     .attr("width", width + margin.right + margin.left)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", "translate("
//       + margin.left + "," + margin.top + ")");
//   var i = 0,
//     duration = 750,
//     root;
//   // declares a tree layout and assigns the size
//   var treemap = d3.tree().size([height, width]);
//   // Assigns parent, children, height, depth
//   root = d3.hierarchy(treeData, function (d) { return d.children; });
//   root.x0 = height / 2;
//   root.y0 = 0;
//   if (root.children) {
//     // Collapse after the second level
//     root.children.forEach(collapse);
//   }
//   update(root);
//   // Collapse the node and all it's children
//   function collapse(d) {
//     if (d.children) {
//       d._children = d.children
//       d._children.forEach(collapse)
//       d.children = null
//     }
//   }
//   function update(source) {
//     // Assigns the x and y position for the nodes
//     var treeData = treemap(root);
//     // Compute the new tree layout.
//     var nodes = treeData.descendants(),
//       links = treeData.descendants().slice(1);
//     // Normalize for fixed-depth.
//     nodes.forEach(function (d) { d.y = d.depth * 180 });
//     // ****************** Nodes section ***************************
//     // Update the nodes...
//     var node = svg.selectAll('g.node')
//       .data(nodes, function (d) { return d.id || (d.id = ++i); });
//     // Enter any new modes at the parent's previous position.
//     var nodeEnter = node.enter().append('g')
//       .attr('class', 'node')
//       .attr("transform", function (d) {
//         return "translate(" + source.y0 + "," + source.x0 + ")";
//       })
//       .on('click', click);
//     var rectHeight = 60, rectWidth = 120;
//     nodeEnter.append('rect')
//       .attr('class', 'node')
//       .attr("width", rectWidth)
//       .attr("height", rectHeight)
//       .attr("x", 0)
//       .attr("y", (rectHeight / 2) * -1)
//       .attr("rx", "5")
//       .style("fill", function (d) {
//         return d.data.fill;
//       });
//     // Add labels for the nodes
//     nodeEnter.append('text')
//       .attr("dy", "-.35em")
//       .attr("x", function (d) {
//         return 13;
//       })
//       .attr("text-anchor", function (d) {
//         return "start";
//       })
//       .text(function (d) { return d.data.name; })
//       .append("tspan")
//       .attr("dy", "1.75em")
//       .attr("x", function (d) {
//         return 13;
//       })
//       .text(function (d) { return d.data.subname; });
//     // UPDATE
//     var nodeUpdate = nodeEnter.merge(node);
//     // Transition to the proper position for the node
//     nodeUpdate.transition()
//       .duration(duration)
//       .attr("transform", function (d) {
//         return "translate(" + d.y + "," + d.x + ")";
//       });
//     // Update the node attributes and style
//     nodeUpdate.select('circle.node')
//       .attr('r', 10)
//       .style("fill", function (d) {
//         return d._children ? "lightsteelblue" : "#fff";
//       })
//       .attr('cursor', 'pointer');
//     // Remove any exiting nodes
//     var nodeExit = node.exit().transition()
//       .duration(duration)
//       .attr("transform", function (d) {
//         return "translate(" + source.y + "," + source.x + ")";
//       })
//       .remove();
//     // On exit reduce the node circles size to 0
//     nodeExit.select('circle')
//       .attr('r', 1e-6);
//     // On exit reduce the opacity of text labels
//     nodeExit.select('text')
//       .style('fill-opacity', 1e-6);
//     // ****************** links section ***************************
//     // Update the links...
//     var link = svg.selectAll('path.link')
//       .data(links, function (d) { return d.id; });
//     // Enter any new links at the parent's previous position.
//     var linkEnter = link.enter().insert('path', "g")
//       .attr("class", "link")
//       .attr('d', function (d) {
//         var o = { x: source.x0, y: source.y0 }
//         return diagonal(o, o)
//       });
//     // UPDATE
//     var linkUpdate = linkEnter.merge(link);
//     // Transition back to the parent element position
//     linkUpdate.transition()
//       .duration(duration)
//       .attr('d', function (d) { return diagonal(d, d.parent) });
//     // Remove any exiting links
//     var linkExit = link.exit().transition()
//       .duration(duration)
//       .attr('d', function (d) {
//         var o = { x: source.x, y: source.y }
//         return diagonal(o, o)
//       })
//       .remove();
//     // Store the old positions for transition.
//     nodes.forEach(function (d) {
//       d.x0 = d.x;
//       d.y0 = d.y;
//     });
//     // Creates a curved (diagonal) path from parent to the child nodes
//     function diagonal(s, d) {
//       let path = `M ${s.y} ${s.x}
//               C ${(s.y + d.y) / 2} ${s.x},
//                 ${(s.y + d.y) / 2} ${d.x},
//                 ${d.y} ${d.x}`
//       return path
//     }
//     // Toggle children on click.
//     function click(d) {
//       if (d.children) {
//         d._children = d.children;
//         d.children = null;
//       } else {
//         d.children = d._children;
//         d._children = null;
//       }
//       update(d);
//     }
//   }
// }
},{}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "43439" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","main.js"], null)
//# sourceMappingURL=/main.1f19ae8e.js.map