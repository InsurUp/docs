"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[4736],{8350:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>l,contentTitle:()=>a,default:()=>u,frontMatter:()=>o,metadata:()=>i,toc:()=>d});var t=s(4848),r=s(8453);const o={sidebar_position:2},a="Translate your site",i={id:"tutorial-extras/translate-your-site",title:"Translate your site",description:"Let's translate docs/intro.md to French.",source:"@site/docs/tutorial-extras/translate-your-site.md",sourceDirName:"tutorial-extras",slug:"/tutorial-extras/translate-your-site",permalink:"/docss/docs/tutorial-extras/translate-your-site",draft:!1,unlisted:!1,editUrl:"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/tutorial-extras/translate-your-site.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_position:2},sidebar:"tutorialSidebar",previous:{title:"Manage Docs Versions",permalink:"/docss/docs/tutorial-extras/manage-docs-versions"}},l={},d=[{value:"Configure i18n",id:"configure-i18n",level:2},{value:"Translate a doc",id:"translate-a-doc",level:2},{value:"Start your localized site",id:"start-your-localized-site",level:2},{value:"Add a Locale Dropdown",id:"add-a-locale-dropdown",level:2},{value:"Build your localized site",id:"build-your-localized-site",level:2}];function c(e){const n={a:"a",admonition:"admonition",code:"code",h1:"h1",h2:"h2",header:"header",img:"img",p:"p",pre:"pre",...(0,r.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.header,{children:(0,t.jsx)(n.h1,{id:"translate-your-site",children:"Translate your site"})}),"\n",(0,t.jsxs)(n.p,{children:["Let's translate ",(0,t.jsx)(n.code,{children:"docs/intro.md"})," to French."]}),"\n",(0,t.jsx)(n.h2,{id:"configure-i18n",children:"Configure i18n"}),"\n",(0,t.jsxs)(n.p,{children:["Modify ",(0,t.jsx)(n.code,{children:"docusaurus.config.js"})," to add support for the ",(0,t.jsx)(n.code,{children:"fr"})," locale:"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-js",metastring:'title="docusaurus.config.js"',children:"export default {\n  i18n: {\n    defaultLocale: 'en',\n    locales: ['en', 'fr'],\n  },\n};\n"})}),"\n",(0,t.jsx)(n.h2,{id:"translate-a-doc",children:"Translate a doc"}),"\n",(0,t.jsxs)(n.p,{children:["Copy the ",(0,t.jsx)(n.code,{children:"docs/intro.md"})," file to the ",(0,t.jsx)(n.code,{children:"i18n/fr"})," folder:"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:"mkdir -p i18n/fr/docusaurus-plugin-content-docs/current/\n\ncp docs/intro.md i18n/fr/docusaurus-plugin-content-docs/current/intro.md\n"})}),"\n",(0,t.jsxs)(n.p,{children:["Translate ",(0,t.jsx)(n.code,{children:"i18n/fr/docusaurus-plugin-content-docs/current/intro.md"})," in French."]}),"\n",(0,t.jsx)(n.h2,{id:"start-your-localized-site",children:"Start your localized site"}),"\n",(0,t.jsx)(n.p,{children:"Start your site on the French locale:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:"npm run start -- --locale fr\n"})}),"\n",(0,t.jsxs)(n.p,{children:["Your localized site is accessible at ",(0,t.jsx)(n.a,{href:"http://localhost:3000/fr/",children:"http://localhost:3000/fr/"})," and the ",(0,t.jsx)(n.code,{children:"Getting Started"})," page is translated."]}),"\n",(0,t.jsx)(n.admonition,{type:"caution",children:(0,t.jsx)(n.p,{children:"In development, you can only use one locale at a time."})}),"\n",(0,t.jsx)(n.h2,{id:"add-a-locale-dropdown",children:"Add a Locale Dropdown"}),"\n",(0,t.jsx)(n.p,{children:"To navigate seamlessly across languages, add a locale dropdown."}),"\n",(0,t.jsxs)(n.p,{children:["Modify the ",(0,t.jsx)(n.code,{children:"docusaurus.config.js"})," file:"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-js",metastring:'title="docusaurus.config.js"',children:"export default {\n  themeConfig: {\n    navbar: {\n      items: [\n        // highlight-start\n        {\n          type: 'localeDropdown',\n        },\n        // highlight-end\n      ],\n    },\n  },\n};\n"})}),"\n",(0,t.jsx)(n.p,{children:"The locale dropdown now appears in your navbar:"}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.img,{alt:"Locale Dropdown",src:s(6866).A+"",width:"370",height:"302"})}),"\n",(0,t.jsx)(n.h2,{id:"build-your-localized-site",children:"Build your localized site"}),"\n",(0,t.jsx)(n.p,{children:"Build your site for a specific locale:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:"npm run build -- --locale fr\n"})}),"\n",(0,t.jsx)(n.p,{children:"Or build your site to include all the locales at once:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:"npm run build\n"})})]})}function u(e={}){const{wrapper:n}={...(0,r.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(c,{...e})}):c(e)}},6866:(e,n,s)=>{s.d(n,{A:()=>t});const t=s.p+"assets/images/localeDropdown-f0d995e751e7656a1b0dbbc1134e49c2.png"},8453:(e,n,s)=>{s.d(n,{R:()=>a,x:()=>i});var t=s(6540);const r={},o=t.createContext(r);function a(e){const n=t.useContext(o);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:a(e.components),t.createElement(o.Provider,{value:n},e.children)}}}]);