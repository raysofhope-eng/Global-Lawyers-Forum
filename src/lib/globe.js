export function mountGlobe() {
  var cvs = document.getElementById("globe");
  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  if (cvs) {
    var ctx = cvs.getContext("2d"),
      W,
      H,
      DPR = Math.min(window.devicePixelRatio || 1, 2),
      t = 0,
      raf = 0;
    if (!ctx) return;
    var line, bodyStart, bodyEnd;
    function updatePalette() {
      var styles = getComputedStyle(cvs);
      line = styles.getPropertyValue("--globe-line").trim();
      bodyStart = styles.getPropertyValue("--globe-body-start").trim();
      bodyEnd = styles.getPropertyValue("--globe-body-end").trim();
    }
    updatePalette();
    var nodes = [
      /* eight chapters plotted at real lon/lat */
      { lon: -0.1, lat: 51.5, name: "London" },
      { lon: -74, lat: 40.7, name: "New York" },
      { lon: 73.0, lat: 33.7, name: "Islamabad" },
      { lon: 46.7, lat: 24.7, name: "Riyadh" },
      { lon: -79.4, lat: 43.7, name: "Toronto" },
      { lon: 29.0, lat: 41.0, name: "Istanbul" },
      { lon: 4.3, lat: 50.8, name: "Brussels" },
      { lon: 55.3, lat: 25.2, name: "Dubai" },
    ];
    function resize() {
      W = cvs.clientWidth;
      H = cvs.clientHeight;
      cvs.width = W * DPR;
      cvs.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    function project(lon, lat, rot) {
      var la = (lat * Math.PI) / 180,
        lo = (lon * Math.PI) / 180 + rot;
      return {
        x: Math.cos(la) * Math.sin(lo),
        y: Math.sin(la),
        z: Math.cos(la) * Math.cos(lo),
      };
    }
    function geo(cx, cy, R, rot) {
      return function (lon, lat) {
        var p = project(lon, lat, rot);
        return { x: cx + p.x * R, y: cy - p.y * R, z: p.z };
      };
    }

    function frame() {
      var cx = W * 0.72,
        cy = H * 0.48,
        R = Math.min(W * 0.62, H * 0.92) * 0.5,
        rot = t;
      var P = geo(cx, cy, R, rot);
      ctx.clearRect(0, 0, W, H);

      // soft golden aura behind the sphere
      var aura = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.5);
      aura.addColorStop(0, "rgba(198,161,91,0.16)");
      aura.addColorStop(0.5, "rgba(198,161,91,0.05)");
      aura.addColorStop(1, "rgba(198,161,91,0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // faint filled sphere for depth
      var body = ctx.createRadialGradient(
        cx - R * 0.3,
        cy - R * 0.3,
        R * 0.1,
        cx,
        cy,
        R,
      );
      body.addColorStop(0, bodyStart);
      body.addColorStop(1, bodyEnd);
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      function drawLatitude(lat, alpha, w) {
        ctx.beginPath();
        var s = false;
        for (var lon = -180; lon <= 180; lon += 4) {
          var p = P(lon, lat);
          if (p.z > -0.05) {
            var a = p.z < 0 ? alpha * 0.28 : alpha;
            if (!s) {
              ctx.moveTo(p.x, p.y);
              s = true;
            } else ctx.lineTo(p.x, p.y);
          } else s = false;
        }
        ctx.strokeStyle = "rgba(" + line + "," + alpha + ")";
        ctx.lineWidth = w;
        ctx.stroke();
      }
      function drawMeridian(lon, alpha, w) {
        ctx.beginPath();
        var s = false;
        for (var lat = -90; lat <= 90; lat += 4) {
          var p = P(lon, lat);
          if (p.z > -0.05) {
            if (!s) {
              ctx.moveTo(p.x, p.y);
              s = true;
            } else ctx.lineTo(p.x, p.y);
          } else s = false;
        }
        ctx.strokeStyle = "rgba(" + line + "," + alpha + ")";
        ctx.lineWidth = w;
        ctx.stroke();
      }

      // graticule — latitudes
      for (var i = -75; i <= 75; i += 15) {
        drawLatitude(i, i === 0 ? 0.34 : 0.13, i === 0 ? 1.3 : 0.9);
      }
      // graticule — meridians (back ones dim, front ones brighter)
      for (var lo = 0; lo < 180; lo += 15) {
        var mid = P(lo, 0);
        drawMeridian(lo, mid.z > 0 ? 0.15 : 0.06, 0.9);
      }

      // animated sweeping highlight meridian (the "drawing" golden line)
      var sweepLon = (t * 46) % 360;
      ctx.save();
      ctx.shadowColor = "rgba(" + line + ",0.9)";
      ctx.shadowBlur = 12;
      drawMeridian(sweepLon, 0.55, 1.6);
      ctx.restore();

      // glowing rim
      ctx.save();
      ctx.shadowColor = "rgba(" + line + ",0.6)";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(" + line + ",0.55)";
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();
      ctx.beginPath();
      ctx.arc(cx, cy, R + 6, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(198,161,91,0.16)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // chapter connection arcs — flowing dashed gold
      var pts = nodes.map(function (n) {
        return P(n.lon, n.lat);
      });
      ctx.save();
      ctx.setLineDash([5, 7]);
      ctx.lineDashOffset = -t * 38;
      for (var a = 0; a < pts.length; a++) {
        for (var b = a + 1; b < pts.length; b++) {
          if (pts[a].z > -0.1 && pts[b].z > -0.1) {
            var mx = (pts[a].x + pts[b].x) / 2,
              my = (pts[a].y + pts[b].y) / 2 - R * 0.28;
            ctx.beginPath();
            ctx.moveTo(pts[a].x, pts[a].y);
            ctx.quadraticCurveTo(mx, my, pts[b].x, pts[b].y);
            ctx.strokeStyle = "rgba(" + line + ",0.18)";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // chapter nodes with pulse
      pts.forEach(function (p) {
        if (p.z <= 0) return;
        var pulse = (Math.sin(t * 2.4) + 1) / 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 9 + 4 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(" + line + "," + (0.35 - 0.22 * pulse) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.save();
        ctx.shadowColor = "rgba(" + line + ",0.9)";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgb(" + line + ")";
        ctx.fill();
        ctx.restore();
      });
    }

    function loop() {
      t += 0.0016;
      frame();
      raf = requestAnimationFrame(loop);
    }
    resize();
    if (reduce) {
      t = 0.7;
      frame();
    } // single static, beautiful frame
    else {
      loop();
    }
    var onResize = function () {
      resize();
      if (reduce) frame();
    };
    window.addEventListener("resize", onResize);
    var onVisibility = function () {
      if (reduce) return;
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    var onThemeChange = function () {
      updatePalette();
      if (reduce) frame();
    };
    var themeObserver = new MutationObserver(onThemeChange);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    var scheme = window.matchMedia("(prefers-color-scheme:dark)");
    scheme.addEventListener("change", onThemeChange);
    return function () {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      themeObserver.disconnect();
      scheme.removeEventListener("change", onThemeChange);
    };
  }
}
