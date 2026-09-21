"use strict";
if (location.hash.startsWith("#access=") || location.hash === "#paid")
  location.replace("/legacy" + location.hash);

// Preserve only a coarse acquisition channel. Never retain click IDs or arbitrary query text.
const acquisition = new URLSearchParams(location.search).get("utm_source")?.toLowerCase();
const channel = ["x", "twitter", "t.co"].includes(acquisition) ? "x" : acquisition ? "other" : "direct";
for (const link of document.querySelectorAll('a[href="/proof/"]')) {
  link.href = "/proof/?source=" + channel;
}
