

export default function Comments() {

  function isScriptLoaded(url?: string) {
    if (!url) url = "https://utteranc.es/client.js";
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length; i--;) {
        if (scripts[i].src == url) return true;
    }
    return false;
}

  return (
    <section
      ref={elem => {
        if (!elem) {
          return;
        }
        if (isScriptLoaded()) return;
        const scriptElem = document.createElement("script");
        scriptElem.src = "https://utteranc.es/client.js";
        scriptElem.async = true;
        scriptElem.crossOrigin = "anonymous";
        scriptElem.setAttribute("repo", process.env.NEXT_PUBLIC_UTTERANCES_REPO);
        scriptElem.setAttribute("issue-term", "pathname");
        scriptElem.setAttribute("theme", "github-dark");
        elem.appendChild(scriptElem);
      }}
    />
  )
}
