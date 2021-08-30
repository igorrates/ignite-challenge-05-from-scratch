

export default function Comments() {
  return (
    <section
      ref={elem => {
        if (!elem) {
          return;
        }
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
