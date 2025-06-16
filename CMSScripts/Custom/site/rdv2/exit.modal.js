! function (n) {
    n.adModal = function (a, o) {
        ! function (a, o) {
            var i = {
                    activeClass: "showing",
                    modalClass: "___ad-modal"
                },
                d = {},
                t = 0,
                l = 0,
                e = 0,
                s = null,
                c = null,

                //clientX = null,
                //clientY = null,
                adShown = false,
                totalUp = 0,
                currentY = 0,
                lastY = 0,

                u = null,
                r = null,
                f = null,
                p = null,
                _ = null,
                C = null,
                g = null,
                v = function () {
                    d = n.extend({}, i, o), s = a.data("config"), m(), h(), w(), M(), y(), k(), B(), T()
                },
                m = function () {
                    0 === (u = n(s.trigger)).length && (u = a)
                },
                h = function () {
                    t = n(window).width(), l = u.height(), e = 0 === u.length ? 0 : s.percentage ? l * (s.percentage / -100) : 0
                },
                w = function () {
                    r || (r = n("<div />").addClass(d.modalClass).appendTo("body"))
                },
                M = function () {
                    p || (p = n("<div />").addClass(d.modalClass + "__overlay").appendTo(r))
                },
                y = function () {
                    f || (f = n("<div />").addClass(d.modalClass + "__content").appendTo(r))
                },
                k = function () {
                    _ || (_ = n("<span />").addClass(d.modalClass + "__close").text("close").appendTo(f))
                },
                B = function () {
                    C || (C = n("<a />").addClass(d.modalClass + "__link").prop("href", s.link).click(b).appendTo(f), s.target && C.prop("target", s.target))
                },
                T = function () {
                    g || (g = n("<img />").addClass(d.modalClass + "__image").appendTo(C));
                    var a = s.img.d;
                    t < 768 && window.matchMedia("(orientation: portrait)").matches && (a = s.img.m), g.prop("src", a)
                },
                W = function (n) {
                    adShown = true;

                    n(document).off('mousemove');
                    //n(document).off('mouseleave');
                    n(window).off('scroll');
                    _OpenModal(); //, c.destroy()
                },
                b = function (n) {
                    ga("send", "event", {
                        eventCategory: s.gaEventCategory,
                        eventAction: "Modal Click",
                        eventLabel: s.gaEventLabel
                    })
                },
                O = function (n) {
                    _CloseModal()
                };
            _OpenModal = function () {
                r.addClass(d.activeClass), _.click(O), p.click(O)
            }, _CloseModal = function () {
                r.removeClass(d.activeClass), _.unbind("click"), p.unbind("click")
            }, _OnWindowResize = function (n) {
                m(), h(), _BindWayPoint(), T()
            }, _BindWayPoint = function () {
                if (adShown) return;
                // c && c.destroy(), c = new Waypoint({
                //     element: u.get(0),
                //     handler: W,
                //     offset: e
                // })


                n(document).mousemove(function (e) {
                    //clientX = e.clientX;
                    //clientY = e.clientY;

                    if ((e.clientX < 300) && (e.clientY < 100)) {
                        W(n);
                    }
                });

                // n(document).mouseleave(function (e) {
                //     if ((clientX < 300) && (clientY < 100)) {
                //         W(n);
                //     }
                // });

                var cs = (function () { 
                    return function () {
                        currentY = window.scrollY;

                        if (currentY > lastY) {
                            totalUp = 0;
                        } else {
                            totalUp += currentY - lastY;
                        }      
                     
                        lastY = currentY;
                        
                        return totalUp;
                    };
                })();

                n(window).scroll(function() {
                    if (cs() < -50) {
                        W(n);
                    }
                });
            }, _BindEvents = function () {
                _BindWayPoint(), n(window).resize(_OnWindowResize)
            }, init = (v(), void _BindEvents())
        }(n(a), o)
    }, n.fn.adModal = function (a) {
        return this.each(function () {
            if (void 0 === n(this).data("adModal")) {
                var o = new n.adModal(this, a);
                n(this).data("adModal", o)
            }
        })
    }, n(function () {
        n(".rd-ad-modal").adModal()
    })
}(jQuery);