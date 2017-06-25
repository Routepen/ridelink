function msToTime(ms) {
  s = 1000;
  m = s * 60;
  h = m*60;

  var sc, mc, hc;
  sc = mc = hc = 0;

  while (ms >= h) {
    hc++;
    ms -= h;
  }

  while (ms >= m) {
    mc++;
    ms -= m;
  }

  while (ms >= s) {
    sc++;
    ms -= s;
  }

  if (mc < 10) {
    mc = "0" + mc;
  }
  if (sc < 10) {
    sc = "0" + sc;
  }

  return hc + ":" + mc + ":" + sc;
}

function updateClock() {
  if (data.confirmedRider) {
    var d = new Date(routeData.riderStatus[data.user._id].confirmedOn);
    d.setDate(d.getDate() + 1);
    d.setHours(d.getHours() - 6);
    var ms = d - Date.now();

    $("#countDown").html(msToTime(ms));
    setTimeout(updateClock, 1000);
  }
}
