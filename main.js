/**
 * Created by Titan Snow on 2016/6/26.
 */
(function () {
    var plugins = [];
    var argv = {unnamed_args: []}, arg_re = /^-(.*?)=(.*)$/, match_arr, len;
    for (var i = 0; i < nw.App.argv.length; ++i) {
        if (arg_re.test(nw.App.argv[i])) {
            match_arr = arg_re.exec(nw.App.argv[i]);
            argv[match_arr[1]] = match_arr[2];
            if (/^".*"$|^'.*'$/.test(argv[match_arr[1]]))  argv[match_arr[1]] = argv[match_arr[1]].slice(1, -1)
        } else {
            len = argv.unnamed_args.push(nw.App.argv[i]);
            if (/^".*"$|^'.*'$/.test(argv.unnamed_args[len - 1]))  argv.unnamed_args[len - 1] = argv.unnamed_args[len - 1].slice(1, -1)
        }
    }

    var fs = require("fs");
    try {
        var pluginDir = fs.readdirSync("./jbrowPlugins");
        pluginDir.forEach(function (fn) {
            if (!/\.js$/.test(fn)) return;
            try {
                var md = require("./jbrowPlugins/" + fn);
                if (md.onmessage)
                    plugins.push(md);
            } catch (err) {
            }
        });
    } catch (err) {
    }
    sendMessageToAllPlugins({type: "selfStart"});

    var globalEventEmitter = new (require("events").EventEmitter)();

    if (sendMessageToAllPlugins({type: "beforeMaximize"})) nw.Window.get().maximize();
    nw.Window.get().on('new-win-policy', function (frame, url, policy) {
        if (!sendMessageToAllPlugins({type: 'beforeNewWinPolicy', target: frame, url: url, policy: policy})) return;
        policy.ignore();
        focusPage(createPage(url));
        flush();
        sendMessageToAllPlugins({type: 'newWinPolicy', target: frame, url: url, policy: policy});
    });
    nw.Window.get().on('navigation', function (frame, url, policy) {
        if (!sendMessageToAllPlugins({type: 'beforeNavigation', target: frame, url: url, policy: policy})) return;
        flush();
        sendMessageToAllPlugins({type: 'navigation', target: frame, url: url, policy: policy})
    });
    function hasPage(id) {
        return !(getTabById(id) === null && getContentById(id) === null);
    }

    function getPageId(ele) {
        return Number(/^(?:tab|content)-([\w\.]+)$/.exec(ele.id)[1]);
    }

    function getTabById(id) {
        return document.getElementById("tab-" + id);
    }

    function getContentById(id) {
        return document.getElementById("content-" + id);
    }

    function createPage(url) {
        if (!sendMessageToAllPlugins({type: "beforeCreatePage", url: url})) return;
        var tab = document.createElement("button");
        tab.classList.add("tab");
        var id;
        do {
            id = +new Date() + Math.random();
        } while (hasPage(id));
        tab.id = "tab-" + id;
        var con = document.createElement("iframe");
        con.classList.add("content");
        con.id = "content-" + id;
        con.nwdisable = true;
        con.nwfaketop = true;
        con.src = url;
        document.getElementsByClassName("tab-wrapper")[0].appendChild(tab);
        document.getElementsByClassName("content-wrapper")[0].appendChild(con);
        tab.addEventListener("click", function () {
            focusPage(getPageId(this));
        });
        tab.addEventListener("dblclick", function () {
            var ns = this.parentNode.querySelectorAll(".tab");
            var pos = Array.prototype.indexOf.call(ns, this);
            if (pos == 0) {
                if (ns.length == 1) {
                    focusPage(createPage("about:newtab"));
                } else {
                    focusPage(getPageId(ns[1]));
                }
            } else {
                focusPage(getPageId(ns[pos - 1]));
            }
            removePage(getPageId(this));
        });
        var rs = Array.prototype.slice.call(document.getElementsByClassName("tab-right"), 0);
        for (var i = 0; i < rs.length; ++i) rs[i].parentNode.appendChild(rs[i]);
        if (sendMessageToAllPlugins({type: "createPage", url: url, id: id}))
            return id;
    }

    function getFocusedPageId() {
        try {
            return getPageId(document.querySelector(".tab.current"))
        } catch (err) {
            throw "Page not found"
        }
    }

    function focusPage(id) {
        if (!sendMessageToAllPlugins({type: "beforeFocusPage", id: id})) return;
        if (!hasPage(id)) throw "Page not found";
        try {
            var focusedId = getFocusedPageId();
            getTabById(focusedId).classList.remove("current");
            getContentById(focusedId).classList.remove("current");
        } catch (err) {
        }
        getTabById(id).classList.add("current");
        getContentById(id).classList.add("current");
        sendMessageToAllPlugins({type: "focusPage", id: id});
    }

    function removePage(id) {
        if (!sendMessageToAllPlugins({type: "beforeRemovePage", id: id})) return;
        getTabById(id).remove();
        getContentById(id).remove();
        sendMessageToAllPlugins({type: "removePage", id: id});
    }

    function flush() {
        if (!sendMessageToAllPlugins({type: "beforeFlushUI"})) return;
        try {
            var tabs = document.getElementsByClassName("tab");
            var tmp;
            for (var i = 0; i < tabs.length; ++i) {
                try {
                    if (tabs[i].querySelector(".tab-inner") === null) {
                        tmp = document.createElement("span");
                        tmp.classList.add("tab-icon");
                        tabs[i].appendChild(tmp);
                        tmp = document.createElement("span");
                        tmp.classList.add("tab-inner");
                        tabs[i].appendChild(tmp);
                    }
                    tabs[i].querySelector(".tab-inner").innerHTML = getContentById(getPageId(tabs[i])).contentDocument.title.replace(/[<>& ]/g, function (c) {
                        switch (c) {
                            case '<':
                                return '&lt;';
                            case '>':
                                return '&gt;';
                            case '&':
                                return '&amp;';
                            case ' ':
                                return '&nbsp;';
                            default:
                                return c;
                        }
                    });
                } catch (err) {
                }
            }
        } catch (err) {
        }
        if (!isFocusURL)try {
            var url_input = document.getElementById("url");
            var focusContent = getContentById(getFocusedPageId());
            if (url_input.value != focusContent.contentWindow.location.href) {
                url_input.value = focusContent.contentWindow.location.href;
                globalEventEmitter.emit("jbrowURLchange");
            }
        } catch (err) {
        }
        //try{var cs=document.getElementsByClassName("content");
        //Array.prototype.forEach.call(cs, function (e) {
        //    e.nwdisable=true;
        //    e.nwfaketop=true;
        //});}catch (err){}

        sendMessageToAllPlugins({type: "flushUI"});
    }

    function hasPlugin(id) {
        return !!plugins[id];
    }

    function sendMessageToPlugin(id, e) {
        var returnValue = true;

        function JBrow_context() {
        }

        JBrow_context.prototype.hasPage = hasPage;
        JBrow_context.prototype.getPageId = getPageId;
        JBrow_context.prototype.getTabById = getTabById;
        JBrow_context.prototype.getContentById = getContentById;
        JBrow_context.prototype.createPage = createPage;
        JBrow_context.prototype.getFocusedPageId = getFocusedPageId;
        JBrow_context.prototype.focusPage = focusPage;
        JBrow_context.prototype.removePage = removePage;
        JBrow_context.prototype.flushUI = flush;
        JBrow_context.prototype.getWindow = function () {
            return window;
        };
        JBrow_context.prototype.getNWWindow = function () {
            return nw.Window.get(this.getWindow());
        };
        JBrow_context.prototype.getDocument = function () {
            return document;
        };
        JBrow_context.prototype.getPlugins = function () {
            return plugins;
        };
        JBrow_context.prototype.getArgv = function () {
            return argv;
        };
        JBrow_context.prototype.sendMessageToPlugin = sendMessageToPlugin;
        JBrow_context.prototype.hasPlugin = hasPlugin;
        JBrow_context.prototype.sendMessageToAllPlugins = sendMessageToAllPlugins;
        e.getContext = function () {
            return new JBrow_context();
        };
        e.setReturnValue = function (bl) {
            returnValue = bl;
        };
        try {
            var fnReturn = plugins[id].onmessage(e);
        } catch (err) {
            return;
        }
        if (typeof fnReturn == "undefined")
            return returnValue;
        else return fnReturn;
    }

    function sendMessageToAllPlugins(e) {
        var returnValue = true;
        var continueSpread = true;
        var fnReturn;
        e.stopSpread = function () {
            continueSpread = false;
        };
        for (var i = 0; hasPlugin(i) && continueSpread; ++i) {
            fnReturn = sendMessageToPlugin(i, e);
            if (typeof fnReturn == "undefined") fnReturn = true;
            returnValue = fnReturn && returnValue;
        }
        return returnValue;
    }


    setInterval(flush, 1000);

    globalEventEmitter.addListener("jbrowURLchange", function () {
        var c = getContentById(getFocusedPageId());
        if (!sendMessageToAllPlugins({type: "beforeURLChange", target: c})) return;
        if (c.contentDocument.readyState == "interactive" || c.contentDocument.readyState == "complete") doit();
        else c.contentDocument.addEventListener("DOMContentLoaded", doit);
        function doit() {
            sendMessageToAllPlugins({type: "frameReady", target: c});
            if (!sendMessageToAllPlugins({type: "beforeIconLoad", target: c})) return;
            var ls = c.contentDocument.getElementsByTagName("link");
            var is = [];
            var icon_place;
            try {
                for (var i = 0; i < ls.length; ++i)try {
                    if (ls[i].rel == "icon" || ls[i].rel == "shortcut icon") {
                        is.push(ls[i]);
                    }
                } catch (err) {
                }
            } catch (err) {
            }
            if (!sendMessageToAllPlugins({type: "iconSelected", icons: is, target: c})) return;
            if (is.length > 0) {
                var icon = is[0];
                var d = 1024;
                is.forEach(function (i) {
                    var sizes = i.sizes;
                    sizes.forEach(function (size) {
                        var re = /^(\d+)[Xx](\d+)$/;
                        if (re.test(size)) {
                            var sxy = re.exec(size);
                            var x = Number(sxy[1]);
                            var y = Number(sxy[2]);
                            var my_d = Math.abs(x * y - 16 * 16);
                            if (my_d <= d) {
                                icon = i;
                                d = my_d;
                            }
                        } else if (size == "any") {
                            icon = i;
                            d = 0;
                        }
                    });
                });
                icon_place = getTabById(getPageId(c)).querySelector(".tab-icon");
                icon_place.innerHTML = "";
                var e_icon = document.createElement("img");
                e_icon.src = icon.href;
                e_icon.alt = "";
                icon_place.appendChild(e_icon);
                sendMessageToAllPlugins({type: "iconLoad", target: c, icon: e_icon});
            } else {
                icon_place = getTabById(getPageId(c)).querySelector(".tab-icon");
                icon_place.innerHTML = "";
                var fav_url = c.contentWindow.location.origin + "/favicon.ico";
                var icon_img = document.createElement("img");
                icon_img.src = fav_url;
                icon_img.alt = "";
                icon_img.addEventListener("load", function () {
                    icon_place.innerHTML = "";
                    icon_place.appendChild(icon_img);
                    sendMessageToAllPlugins({type: "iconLoad", target: c, icon: icon_img});
                });
            }
        }

        sendMessageToAllPlugins({type: "URLChange", target: c});
    });
    document.addEventListener("DOMContentLoaded", function () {
        if (!sendMessageToAllPlugins({type: "beforeReady"})) return;
        document.getElementsByClassName("add-tab")[0].addEventListener("click", function () {
            focusPage(createPage("about:newtab"));
        });
        var homed = false;
        if (argv.unnamed_args.length > 0) {
            var url_test = document.createElement("input");
            url_test.type = "url";
            url_test.value = argv.unnamed_args[0];
            if (url_test.checkValidity()) {
                focusPage(createPage(argv.unnamed_args[0]));
                homed = true;
            }
        }
        if (!homed) {
            if (argv.hasOwnProperty("open_url")) {
                focusPage(createPage(argv.open_url));
            } else {
                focusPage(createPage("https://www.bing.com"));
            }
            homed = true;
        }
        document.getElementsByClassName("minz")[0].addEventListener("click", function () {
            nw.Window.get().minimize();
        });
        document.getElementsByClassName("maxz")[0].addEventListener("click", function () {
            if (!isMaxzed)nw.Window.get().maximize();
            else {
                isMaxzed = false;
                nw.Window.get().unmaximize();
            }
        });
        document.getElementsByClassName("cloz")[0].addEventListener("click", function () {
            nw.Window.get().close();
        });
        var url_input = document.getElementById("url");
        url_input.addEventListener("focus", function () {
            isFocusURL = true;
            this.select();
        });
        url_input.addEventListener("blur", function () {
            isFocusURL = false;
            this.setSelectionRange(0, 0);
        });
        url_input.parentNode.addEventListener("submit", function (e) {
            e.preventDefault();
            var url = url_input.value;
            //if(/^\?/.test(url)) url="https://cn.bing.com/search?q="+encodeURIComponent(/^\?(.*)$/.exec(url)[1]);
            //else if(!/:\/\//.test(url)) url="http://"+url;
            var u = document.createElement("input");
            u.type = "url";
            u.value = url;
            if (!u.checkValidity()) {
                var new_url = "http://" + url;
                u.value = new_url;
                if (u.checkValidity() && /^\S+?\.\S+$/.test(url)) {
                    url = new_url;
                } else {
                    url = "https://www.bing.com/search?q=" + encodeURIComponent(url);
                }
            }
            url_input.value = getContentById(getFocusedPageId()).contentWindow.location.href;
            getContentById(getFocusedPageId()).src = url;
            url_input.blur();
        });
        sendMessageToAllPlugins({type: "ready"});
    });
    var isMaxzed = false;
    nw.Window.get().on("maximize", function () {
        isMaxzed = true;
        sendMessageToAllPlugins({type: "maximize"});
    });
    nw.Window.get().on("resize", function () {
        isMaxzed = false;
        sendMessageToAllPlugins({type: "WindowResize"});
    });
    var isFocusURL = false;
    window.addEventListener("load", function () {
        if (!sendMessageToAllPlugins({type: "beforeLoad"})) return;
        if (localStorage.getItem("jbrow_first_use") === null) {
            localStorage.setItem("jbrow_first_use", "no");
            if (confirm("Use jBrow for the first time? \nLet's get an easy beginning! \n\n第一次使用？\n让我们来一个简单的开始！")) {
                var intro_css = document.createElement("link");
                intro_css.rel = "stylesheet";
                intro_css.href = "introjs.min.css";
                document.head.appendChild(intro_css);
                var intro_js = document.createElement("script");
                intro_js.src = "intro.min.js";
                document.head.appendChild(intro_js);
                intro_js.addEventListener("load", function () {
                    document.body.classList.add("first-use");
                    introJs().setOptions({
                        prevLabel: "Prev 上一步",
                        nextLabel: "Next 下一步",
                        skipLabel: "Skip 跳过",
                        doneLabel: "Done! 大功告成！"
                    }).oncomplete(function () {
                        document.body.classList.remove("first-use");
                    }).onexit(function () {
                        document.body.classList.remove("first-use");
                    }).start();
                });
            }
        }
        sendMessageToAllPlugins({type: "load"});
    });
    nw.Window.get().on("close", function () {
        if (sendMessageToAllPlugins({type: "beforeClose"})) {
            this.close(true);
            sendMessageToAllPlugins({type: "close"});
        }
    })
})();