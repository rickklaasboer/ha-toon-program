/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),s=new WeakMap;let n=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const i=this.t;if(e&&void 0===t){const e=void 0!==i&&1===i.length;e&&(t=s.get(i)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&s.set(i,t))}return t}toString(){return this.cssText}};const o=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:r,defineProperty:a,getOwnPropertyDescriptor:l,getOwnPropertyNames:c,getOwnPropertySymbols:d,getPrototypeOf:h}=Object,p=globalThis,u=p.trustedTypes,g=u?u.emptyScript:"",f=p.reactiveElementPolyfillSupport,y=(t,e)=>t,m={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},$=(t,e)=>!r(t,e),v={attribute:!0,type:String,converter:m,reflect:!1,useDefault:!1,hasChanged:$};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),p.litPropertyMetadata??=new WeakMap;let _=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=v){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&a(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:n}=l(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const o=s?.call(this);n?.call(this,e),this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??v}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=h(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...c(t),...d(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(o(t))}else void 0!==t&&e.push(o(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((i,s)=>{if(e)i.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of s){const s=document.createElement("style"),n=t.litNonce;void 0!==n&&s.setAttribute("nonce",n),s.textContent=e.cssText,i.appendChild(s)}})(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:m).toAttribute(e,i.type);this._$Em=t,null==n?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:m;this._$Em=s;const o=n.fromAttribute(e,t.type);this[s]=o??this._$Ej?.get(s)??o,this._$Em=null}}requestUpdate(t,e,i,s=!1,n){if(void 0!==t){const o=this.constructor;if(!1===s&&(n=this[t]),i??=o.getPropertyOptions(t),!((i.hasChanged??$)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:n},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==n||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};_.elementStyles=[],_.shadowRootOptions={mode:"open"},_[y("elementProperties")]=new Map,_[y("finalized")]=new Map,f?.({ReactiveElement:_}),(p.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const b=globalThis,x=t=>t,w=b.trustedTypes,A=w?w.createPolicy("lit-html",{createHTML:t=>t}):void 0,k="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,E="?"+S,C=`<${E}>`,T=document,D=()=>T.createComment(""),M=t=>null===t||"object"!=typeof t&&"function"!=typeof t,O=Array.isArray,P="[ \t\n\f\r]",z=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,H=/-->/g,U=/>/g,N=RegExp(`>|${P}(?:([^\\s"'>=/]+)(${P}*=${P}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),R=/'/g,j=/"/g,V=/^(?:script|style|textarea|title)$/i,I=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),L=Symbol.for("lit-noChange"),B=Symbol.for("lit-nothing"),W=new WeakMap,F=T.createTreeWalker(T,129);function K(t,e){if(!O(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(e):e}const q=(t,e)=>{const i=t.length-1,s=[];let n,o=2===e?"<svg>":3===e?"<math>":"",r=z;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,d=0;for(;d<i.length&&(r.lastIndex=d,l=r.exec(i),null!==l);)d=r.lastIndex,r===z?"!--"===l[1]?r=H:void 0!==l[1]?r=U:void 0!==l[2]?(V.test(l[2])&&(n=RegExp("</"+l[2],"g")),r=N):void 0!==l[3]&&(r=N):r===N?">"===l[0]?(r=n??z,c=-1):void 0===l[1]?c=-2:(c=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?N:'"'===l[3]?j:R):r===j||r===R?r=N:r===H||r===U?r=z:(r=N,n=void 0);const h=r===N&&t[e+1].startsWith("/>")?" ":"";o+=r===z?i+C:c>=0?(s.push(a),i.slice(0,c)+k+i.slice(c)+S+h):i+S+(-2===c?e:h)}return[K(t,o+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class Z{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let n=0,o=0;const r=t.length-1,a=this.parts,[l,c]=q(t,e);if(this.el=Z.createElement(l,i),F.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=F.nextNode())&&a.length<r;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(k)){const e=c[o++],i=s.getAttribute(t).split(S),r=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:r[2],strings:i,ctor:"."===r[1]?X:"?"===r[1]?tt:"@"===r[1]?et:Q}),s.removeAttribute(t)}else t.startsWith(S)&&(a.push({type:6,index:n}),s.removeAttribute(t));if(V.test(s.tagName)){const t=s.textContent.split(S),e=t.length-1;if(e>0){s.textContent=w?w.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],D()),F.nextNode(),a.push({type:2,index:++n});s.append(t[e],D())}}}else if(8===s.nodeType)if(s.data===E)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=s.data.indexOf(S,t+1));)a.push({type:7,index:n}),t+=S.length-1}n++}}static createElement(t,e){const i=T.createElement("template");return i.innerHTML=t,i}}function G(t,e,i=t,s){if(e===L)return e;let n=void 0!==s?i._$Co?.[s]:i._$Cl;const o=M(e)?void 0:e._$litDirective$;return n?.constructor!==o&&(n?._$AO?.(!1),void 0===o?n=void 0:(n=new o(t),n._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=n:i._$Cl=n),void 0!==n&&(e=G(t,n._$AS(t,e.values),n,s)),e}class J{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??T).importNode(e,!0);F.currentNode=s;let n=F.nextNode(),o=0,r=0,a=i[0];for(;void 0!==a;){if(o===a.index){let e;2===a.type?e=new Y(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new it(n,this,t)),this._$AV.push(e),a=i[++r]}o!==a?.index&&(n=F.nextNode(),o++)}return F.currentNode=T,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class Y{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=B,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=G(this,t,e),M(t)?t===B||null==t||""===t?(this._$AH!==B&&this._$AR(),this._$AH=B):t!==this._$AH&&t!==L&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>O(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==B&&M(this._$AH)?this._$AA.nextSibling.data=t:this.T(T.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Z.createElement(K(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new J(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=W.get(t.strings);return void 0===e&&W.set(t.strings,e=new Z(t)),e}k(t){O(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const n of t)s===e.length?e.push(i=new Y(this.O(D()),this.O(D()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=x(t).nextSibling;x(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class Q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,n){this.type=1,this._$AH=B,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=B}_$AI(t,e=this,i,s){const n=this.strings;let o=!1;if(void 0===n)t=G(this,t,e,0),o=!M(t)||t!==this._$AH&&t!==L,o&&(this._$AH=t);else{const s=t;let r,a;for(t=n[0],r=0;r<n.length-1;r++)a=G(this,s[i+r],e,r),a===L&&(a=this._$AH[r]),o||=!M(a)||a!==this._$AH[r],a===B?t=B:t!==B&&(t+=(a??"")+n[r+1]),this._$AH[r]=a}o&&!s&&this.j(t)}j(t){t===B?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class X extends Q{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===B?void 0:t}}class tt extends Q{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==B)}}class et extends Q{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){if((t=G(this,t,e,0)??B)===L)return;const i=this._$AH,s=t===B&&i!==B||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==B&&(i===B||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class it{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){G(this,t)}}const st=b.litHtmlPolyfillSupport;st?.(Z,Y),(b.litHtmlVersions??=[]).push("3.3.3");const nt=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class ot extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let n=s._$litPart$;if(void 0===n){const t=i?.renderBefore??null;s._$litPart$=n=new Y(e.insertBefore(D(),t),t,void 0,i??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return L}}ot._$litElement$=!0,ot.finalized=!0,nt.litElementHydrateSupport?.({LitElement:ot});const rt=nt.litElementPolyfillSupport;rt?.({LitElement:ot}),(nt.litElementVersions??=[]).push("4.2.2");const at=1430,lt=[1,2,3,4,5,6,0];function ct(t){return lt[t]}function dt(t){const e=/^(\d{2}):(\d{2})$/.exec(t);if(!e)throw new Error(`invalid time: ${t}`);return 60*Number(e[1])+Number(e[2])}function ht(t){const e=Math.floor(t/60),i=t%60;return`${String(e).padStart(2,"0")}:${String(i).padStart(2,"0")}`}function pt(t,e){return ht(Math.min(at,Math.max(0,dt(t)+e)))}function ut(t){if(0===t.length)return"12:00";const e=new Set(t.map(t=>dt(t.time))),i=Math.max(...e),s=60*(Math.floor(i/60)+1);if(s<=at&&!e.has(s))return ht(s);for(let t=0;t<=at;t+=10)if(!e.has(t))return ht(t);throw new Error("no free time slot left")}function gt(t){return void 0!==t&&"unavailable"!==t.state&&Array.isArray(t.attributes.days)&&"program_hash"in t.attributes}function ft(t,e){return`${t.toLocaleString(e,{minimumFractionDigits:1,maximumFractionDigits:1})}°`}const yt={title:"Weekprogramma",on:"Aan",now:"Nu",at:"om",to:"naar",tapDay:"Tik op een dag om de tijden aan te passen.",vacation:"Vakantie",back:"Terug",addTime:"Tijd toevoegen",copyTo:"Kopieer naar…",save:"Opslaan",saving:"Opslaan…",unsaved:"Wijziging op {day} nog niet opgeslagen",discardConfirm:"De wijziging op {day} is nog niet opgeslagen. Weggooien?",copyHint:"Sla eerst je wijziging op om te kopiëren.",done:"Klaar",fromDay:"{day}, vanaf",time:"Tijd",earlier:"10 minuten eerder",later:"10 minuten later",preset:"Stand",removeBlock:"Dit blok verwijderen",readOnlyState:"Deze stand kan hier niet gewijzigd worden.",copyTitle:"Kopieer {day} naar",copyAction:"Kopiëren",cancel:"Annuleren",planned:"Gepland",noVacation:"Geen vakantie gepland.",newVacation:"Nieuwe vakantie",from:"Van",until:"Tot",vacationTemp:"Temperatuur tijdens vakantie",scheduleVacation:"Vakantie inplannen",removeVacation:"Vakantie verwijderen",noEntity:"Geen Toon-programma gevonden. Stel de entiteit in de kaartconfiguratie in.",unreachable:"Toon niet bereikbaar",reload:"Opnieuw laden",rangeTo:"tot",presets:{0:"Comfort",1:"Thuis",2:"Slapen",3:"Weg",4:"Vakantie"},daysShort:["Ma","Di","Wo","Do","Vr","Za","Zo"],daysLong:["maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag","zondag"],cardName:"Toon weekprogramma",cardDescription:"Bekijk en bewerk het weekprogramma van je Toon."},mt={title:"Week program",on:"On",now:"Now",at:"at",to:"to",tapDay:"Tap a day to edit its times.",vacation:"Vacation",back:"Back",addTime:"Add time",copyTo:"Copy to…",save:"Save",saving:"Saving…",unsaved:"Change on {day} not saved yet",discardConfirm:"The change on {day} is not saved yet. Discard it?",copyHint:"Save your change first to copy.",done:"Done",fromDay:"{day}, from",time:"Time",earlier:"10 minutes earlier",later:"10 minutes later",preset:"Preset",removeBlock:"Remove this block",readOnlyState:"This preset cannot be changed here.",copyTitle:"Copy {day} to",copyAction:"Copy",cancel:"Cancel",planned:"Planned",noVacation:"No vacation planned.",newVacation:"New vacation",from:"From",until:"Until",vacationTemp:"Temperature during vacation",scheduleVacation:"Schedule vacation",removeVacation:"Remove vacation",noEntity:"No Toon program found. Set the entity in the card configuration.",unreachable:"Toon not reachable",reload:"Reload",rangeTo:"to",presets:{0:"Comfort",1:"Home",2:"Sleep",3:"Away",4:"Vacation"},daysShort:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],daysLong:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],cardName:"Toon week program",cardDescription:"View and edit the week program of your Toon."};function $t(t){return t.toLowerCase().startsWith("nl")?yt:mt}function vt(t,e){return t.replace(/\{(\w+)\}/g,(t,i)=>{if(!(i in e))throw new Error(`missing placeholder ${i}`);return e[i]})}const _t=["comfort","home","sleep","away","vacation"],bt={0:"#c4561f",1:"#f2b04a",2:"#27407a",3:"#a9b0b8",4:"#6b8f71"};function xt(t,e,i,s){const n=function(t,e,i){const s=[...i].sort((t,e)=>dt(t.time)-dt(e.time)),n=[];let o=e,r=0;for(const t of s){const e=dt(t.time);e>r&&n.push({state:o,fromMin:r,toMin:e}),o=t.state,r=e}return n.push({state:o,fromMin:r,toMin:1440}),n}(0,t,e);return I`<span class="bar" style="height:${i}px;border-radius:${s}px">
    ${n.map(t=>I`<span
          style="flex:0 0 ${((t.toMin-t.fromMin)/1440*100).toFixed(2)}%;background:${bt[t.state]}"
        ></span>`)}
  </span>`}function wt(t){return t?I`<div class="error" role="alert">${t}</div>`:""}function At(t,e){const i=new Date(t);return`${i.toLocaleDateString(e,{weekday:"short",day:"numeric",month:"short"})} ${i.toLocaleTimeString(e,{hour:"2-digit",minute:"2-digit",hour12:!1})}`}function kt(t){const{t:e,attrs:i}=t,s=_t.indexOf(t.stateKey),n=e=>ft(i.states[String(e)],t.lang),o=i.next_state?_t.indexOf(i.next_state):-1;return I`
    <div class="head">
      <h1>${e.title}</h1>
      <label class="toggle">
        <input
          type="checkbox"
          .checked=${i.program_enabled}
          @change=${e=>t.onToggle(e.target.checked,e.target)}
        />
        ${e.on}
      </label>
    </div>
    ${s>=0?I`<div class="sub">
          ${e.now} <strong>${e.presets[String(s)]} ${n(s)}</strong>${i.next_time&&o>=0?I`, ${e.at} ${r=i.next_time,a=t.lang,new Date(r).toLocaleTimeString(a,{hour:"2-digit",minute:"2-digit",hour12:!1})} ${e.to} ${e.presets[String(o)]} ${n(o)}`:""}
        </div>`:""}
    <div class="weekbars">
      <div class="axis"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
      ${e.daysShort.map((e,s)=>{const n=i.days[ct(s)];return I`<button type="button" class="dayrow" @click=${()=>t.onDay(s)}>
          <span class="daylabel">${e}</span>
          ${xt(n.carry_in,n.points,28,6)}
        </button>`})}
    </div>
    <div class="legend">
      ${[0,1,2,3].map(t=>I`<span><i style="background:${bt[t]}"></i>${e.presets[String(t)]}
            ${n(t)}</span>`)}
    </div>
    <div class="row">
      <button type="button" class="outline" @click=${t.onVacation}>${e.vacation}</button>
    </div>
    <div class="hint">${e.tapDay}</div>
  `;var r,a}function St(t){return String(t).padStart(2,"0")}function Et(t){return`${t.getFullYear()}-${St(t.getMonth()+1)}-${St(t.getDate())}T${St(t.getHours())}:${St(t.getMinutes())}`}function Ct(t){return t instanceof Error?t.message:String("object"==typeof t&&null!==t&&"message"in t?t.message:t)}class Tt extends ot{constructor(){super(...arguments),this._view="week",this._uiDay=0,this._draft=null,this._draftHash="",this._editIdx=null,this._copySel=new Set,this._copyOpen=!1,this._busy=!1,this._error=null,this._conflict=!1,this._vac=null}setConfig(t){this._config=t}getCardSize(){return 6}static getStubConfig(){return{}}attrs(t){const e=this.hass.states[t];if(!e)throw new Error(`entity not found: ${t}`);return e.attributes}deviceId(t){const e=this.hass.entities[t]?.device_id;if(!e)throw new Error(`no device for ${t}`);return e}switchId(t){const e=this.deviceId(t),i=Object.keys(this.hass.entities).find(t=>t.startsWith("switch.")&&this.hass.entities[t].device_id===e&&"toon_program"===this.hass.entities[t].platform);if(!i)throw new Error("program switch entity not found");return i}async call(t,e,i){this._busy=!0,this._error=null,this._conflict=!1;try{return await this.hass.callService("toon_program",t,{device_id:this.deviceId(i),...e}),!0}catch(t){this._error=Ct(t);const e=t;return this._conflict="program_changed"===e.translation_key,!1}finally{this._busy=!1}}async toggle(t,e,i){this._error=null;try{await this.hass.callService("switch",e?"turn_on":"turn_off",{entity_id:this.switchId(t)})}catch(t){i.checked=!e,this._error=Ct(t)}}reload(){this._draft=null,this._editIdx=null,this._error=null,this._conflict=!1}selectDay(t){this._uiDay=t,this._error=null,this._view="day"}tab(t){if(t!==this._uiDay){if(this._draft){const t=$t(this.hass.language);if(!window.confirm(vt(t.discardConfirm,{day:t.daysLong[this._uiDay]})))return;this._draft=null}this.selectDay(t)}}points(t){return this._draft??this.attrs(t).days[ct(this._uiDay)].points}setDraft(t,e){this._draft||(this._draftHash=this.attrs(t).program_hash),this._draft=e}async save(t){if(!this._draft)return;await this.call("set_day",{day:ct(this._uiDay),points:this._draft,program_hash:this._draftHash},t)&&(this._draft=null,this._editIdx=null)}async copy(t){await this.call("copy_day",{source:ct(this._uiDay),targets:[...this._copySel].map(ct),program_hash:this.attrs(t).program_hash},t)&&(this._copyOpen=!1,this._copySel=new Set)}vac(t){if(this._vac)return this._vac;const e=new Date;e.setMinutes(0,0,0),e.setHours(e.getHours()+1);const i=new Date(e.getTime()+864e5);return{from:Et(e),to:Et(i),temp:String(t.vacation_temperature)}}async scheduleVacation(t,e){const i=this.vac(e);await this.call("set_vacation",{start:`${i.from}:00`,end:`${i.to}:00`,temperature:Number(i.temp)},t)&&(this._vac=null)}willUpdate(t){t.has("_view")&&(this._error=null)}render(){if(!this.hass||!this._config)return I``;const t=$t(this.hass.language),e=this.hass.language,i=function(t,e,i){if(i)return i in t?gt(t[i])?{kind:"ok",id:i}:{kind:"unavailable",id:i}:{kind:"none"};const s=Object.keys(e).filter(t=>t.startsWith("sensor.")&&"toon_program"===e[t].platform),n=s.find(e=>gt(t[e]));return n?{kind:"ok",id:n}:s.length>0?{kind:"unavailable",id:s[0]}:{kind:"none"}}(this.hass.states,this.hass.entities,this._config.entity);if("none"===i.kind)return I`<ha-card><div class="body hint">${t.noEntity}</div></ha-card>`;if("unavailable"===i.kind)return I`<ha-card><div class="body error" role="alert">${t.unreachable}</div></ha-card>`;const s=i.id,n=this.attrs(s),o=this.hass.states[s].state;let r,a=B;if("vacation"===this._view){const i=this.vac(n);r=function(t){const{t:e}=t,i=(e,i,s,n,o)=>I`
    <label class="field">${e}
      <input type=${i} step=${o??""} .value=${s} @input=${e=>t.onField(n,e.target.value)} />
    </label>`;return I`
    <div class="head">
      <button type="button" class="back" aria-label=${e.back} @click=${t.onBack}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>
      </button>
      <h1>${e.vacation}</h1>
    </div>
    <h2>${e.planned}</h2>
    ${0===t.attrs.holidays.length?I`<div class="hint">${e.noVacation}</div>`:t.attrs.holidays.map(i=>I`<div class="holiday">
            <div class="htext">
              <span class="htitle">${At(i.start,t.lang)} ${e.rangeTo} ${At(i.end,t.lang)}</span>
              <span class="hsub">${e.presets[4]}, ${ft(t.attrs.vacation_temperature,t.lang)}</span>
            </div>
            <button type="button" class="icon danger" aria-label=${e.removeVacation} ?disabled=${t.busy} @click=${()=>t.onRemove(i.entry_id)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path></svg>
            </button>
          </div>`)}
    <h2>${e.newVacation}</h2>
    ${i(e.from,"datetime-local",t.from,"from")}
    ${i(e.until,"datetime-local",t.to,"to")}
    ${i(e.vacationTemp,"number",t.temp,"temp","0.5")}
    ${wt(t.error)}
    <button type="button" class="primary wide" ?disabled=${t.busy||!t.from||!t.to||!t.temp} @click=${t.onSubmit}>${e.scheduleVacation}</button>
  `}({t:t,lang:e,attrs:n,...i,busy:this._busy,error:this._error,onField:(t,e)=>this._vac={...i,[t]:e},onSubmit:()=>{this.scheduleVacation(s,n)},onRemove:t=>{this.call("remove_vacation",{entry_id:t},s)},onBack:()=>this._view="week"})}else if("day"===this._view){const i=n.days[ct(this._uiDay)],o=this.points(s);if(r=function(t){const{t:e}=t,i=t.points.map((t,e)=>({pt:t,index:e})).sort((t,e)=>dt(t.pt.time)-dt(e.pt.time));return I`
    <div class="head">
      <button type="button" class="back" aria-label=${e.back} @click=${t.onBack}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>
      </button>
      <h1>${e.title}</h1>
    </div>
    <div class="tabs">
      ${e.daysShort.map((e,i)=>I`<button type="button" class="tab ${i===t.uiDay?"active":""}" @click=${()=>t.onTab(i)}>${e}</button>`)}
    </div>
    ${xt(t.day.carry_in,t.points,12,4)}
    <div class="points">
      ${i.map(({pt:i,index:s})=>I`<button type="button" class="point" @click=${()=>t.onEdit(s)}>
          <span class="ptime">${i.time}</span>
          <i class="dot" style="background:${bt[i.state]}"></i>
          <span class="pname">${e.presets[String(i.state)]}</span>
          <span class="ptemp">${ft(t.attrs.states[String(i.state)],t.lang)}</span>
        </button>`)}
    </div>
    <div class="row">
      <button type="button" class="outline" @click=${t.onAdd}>${e.addTime}</button>
      <button type="button" class="outline" ?disabled=${t.dirty} title=${t.dirty?e.copyHint:""} @click=${t.onCopy}>${e.copyTo}</button>
    </div>
    ${wt(t.error)}
    ${t.error&&t.conflict?I`<button type="button" class="outline" @click=${t.onReload}>${e.reload}</button>`:""}
    ${t.dirty?I`<div class="savebar">
          <span>${vt(e.unsaved,{day:e.daysLong[t.uiDay]})}</span>
          <button type="button" class="primary" ?disabled=${t.saving} @click=${t.onSave}>${t.saving?e.saving:e.save}</button>
        </div>`:""}
  `}({t:t,lang:e,attrs:n,uiDay:this._uiDay,day:i,points:o,dirty:null!==this._draft,saving:this._busy,error:this._copyOpen||null!==this._editIdx?null:this._error,onTab:t=>this.tab(t),onEdit:t=>this._editIdx=t,onAdd:()=>{try{this.setDraft(s,[...o,{time:ut(o),state:1}]),this._editIdx=o.length}catch(t){this._error=Ct(t)}},onCopy:()=>{this._error=null,this._copyOpen=!0},onSave:()=>{this.save(s)},conflict:this._conflict,onReload:()=>this.reload(),onBack:()=>{if(this._draft){if(!window.confirm(vt(t.discardConfirm,{day:t.daysLong[this._uiDay]})))return;this._draft=null}this._view="week"}}),null!==this._editIdx&&o[this._editIdx]){const i=this._editIdx;a=function(t){const{t:e,point:i}=t,s=4===i.state;return I`
    <div class="backdrop" @click=${t.onClose}></div>
    <div class="sheet" role="dialog">
      <div class="head">
        <h1>${vt(e.fromDay,{day:e.daysLong[t.uiDay].replace(/^./,t=>t.toUpperCase())})}</h1>
        <button type="button" class="link" @click=${t.onClose}>${e.done}</button>
      </div>
      <div class="timepick">
        <button type="button" class="round" aria-label=${e.earlier} @click=${()=>t.onChange({...i,time:pt(i.time,-10)})}>−10</button>
        <label class="timefield">
          <span>${e.time}</span>
          <input
            type="time"
            step="600"
            .value=${i.time}
            @change=${e=>{const s=e.target.value;s&&t.onChange({...i,time:s})}}
          />
        </label>
        <button type="button" class="round" aria-label=${e.later} @click=${()=>t.onChange({...i,time:pt(i.time,10)})}>+10</button>
      </div>
      ${s?I`<div class="hint">${e.presets[4]}: ${e.readOnlyState}</div>`:I`<fieldset class="presets">
            <legend>${e.preset}</legend>
            ${[0,1,2,3].map(s=>I`<label class="preset ${i.state===s?"selected":""}">
                <input
                  type="radio"
                  name="state"
                  .checked=${i.state===s}
                  @change=${()=>t.onChange({...i,state:s})}
                />
                <i class="dot" style="background:${bt[s]}"></i>
                ${e.presets[String(s)]} ${ft(t.attrs.states[String(s)],t.lang)}
              </label>`)}
          </fieldset>`}
      ${s?"":I`<button type="button" class="danger" @click=${t.onDelete}>${e.removeBlock}</button>`}
    </div>
  `}({t:t,lang:e,attrs:n,uiDay:this._uiDay,point:o[i],onChange:t=>this.setDraft(s,o.map((e,s)=>s===i?t:e)),onDelete:()=>{this.setDraft(s,o.filter((t,e)=>e!==i)),this._editIdx=null},onClose:()=>this._editIdx=null})}else this._copyOpen&&(a=function(t){const{t:e}=t;return I`
    <div class="backdrop" @click=${t.onClose}></div>
    <div class="sheet" role="dialog">
      <div class="head"><h1>${vt(e.copyTitle,{day:e.daysLong[t.uiDay]})}</h1></div>
      <div class="presets">
        ${e.daysShort.map((e,i)=>i===t.uiDay?"":I`<label class="preset ${t.selected.has(i)?"selected":""}">
                <input
                  type="checkbox"
                  .checked=${t.selected.has(i)}
                  @change=${e=>t.onToggle(i,e.target.checked)}
                />
                ${e}
              </label>`)}
      </div>
      ${wt(t.error)}
      <div class="row">
        <button type="button" class="outline" @click=${t.onClose}>${e.cancel}</button>
        <button type="button" class="primary" ?disabled=${t.busy||0===t.selected.size} @click=${t.onConfirm}>${e.copyAction}</button>
      </div>
    </div>
  `}({t:t,uiDay:this._uiDay,selected:this._copySel,busy:this._busy,error:this._error,onToggle:(t,e)=>{const i=new Set(this._copySel);e?i.add(t):i.delete(t),this._copySel=i},onConfirm:()=>{this.copy(s)},onClose:()=>this._copyOpen=!1}))}else r=kt({t:t,lang:e,attrs:n,stateKey:o,onToggle:(t,e)=>{this.toggle(s,t,e)},onDay:t=>this.selectDay(t),onVacation:()=>this._view="vacation"});return I`<ha-card class=${a===B?"":"sheet-open"}><div class="body">${r}${"week"===this._view&&this._error?I`<div class="error" role="alert">${this._error}</div>`:B}</div>${a}</ha-card>`}}Tt.properties={hass:{attribute:!1},_config:{state:!0},_view:{state:!0},_uiDay:{state:!0},_draft:{state:!0},_draftHash:{state:!0},_editIdx:{state:!0},_copySel:{state:!0},_copyOpen:{state:!0},_busy:{state:!0},_error:{state:!0},_conflict:{state:!0},_vac:{state:!0}},Tt.styles=((t,...e)=>{const s=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new n(s,t,i)})`
    :host { display: block; }
    ha-card { position: relative; overflow: hidden; }
    ha-card.sheet-open { min-height: 560px; }
    .body { padding: 16px; display: flex; flex-direction: column; gap: 14px; color: var(--primary-text-color); }
    h1, h2 { margin: 0; font-size: 18px; font-weight: 600; }
    button { font: inherit; cursor: pointer; color: inherit; }
    button:disabled { opacity: 0.5; cursor: default; }
    .head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .head h1 { flex: 1; }
    .toggle { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--secondary-text-color); min-height: 44px; }
    .toggle input { width: 20px; height: 20px; accent-color: var(--primary-color); }
    .sub, .hint { font-size: 14px; color: var(--secondary-text-color); }
    .sub strong { color: var(--primary-text-color); }
    .weekbars { display: flex; flex-direction: column; gap: 6px; }
    .axis { display: flex; padding-left: 36px; font-size: 11px; color: var(--secondary-text-color); justify-content: space-between; }
    .dayrow { display: flex; align-items: center; gap: 8px; min-height: 44px; background: none; border: none; padding: 0; text-align: left; }
    .daylabel { width: 28px; font-size: 14px; font-weight: 600; }
    .bar { flex: 1; display: flex; overflow: hidden; }
    .legend { display: flex; flex-wrap: wrap; gap: 12px; font-size: 13px; color: var(--secondary-text-color); }
    .legend span { display: flex; align-items: center; gap: 6px; }
    .legend i { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
    .row { display: flex; gap: 8px; }
    .row button { flex: 1; }
    .outline, .primary { min-height: 44px; border-radius: 8px; font-size: 15px; padding: 0 18px; }
    .outline { border: 1.5px solid var(--primary-color); background: var(--card-background-color); color: var(--primary-color); font-weight: 500; }
    .primary { border: none; background: var(--primary-color); color: var(--text-primary-color, #fff); font-weight: 600; }
    .primary.wide { min-height: 48px; }
    .danger { color: var(--error-color); }
    button.danger { min-height: 44px; border: none; background: none; font-size: 15px; font-weight: 500; align-self: flex-start; padding: 0; }
    .back, .icon { width: 44px; height: 44px; border: none; background: none; display: flex; align-items: center; justify-content: center; padding: 0; }
    .link { min-height: 44px; padding: 0 8px; border: none; background: none; color: var(--primary-color); font-size: 15px; }
    .tabs { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
    .tab { min-height: 44px; border-radius: 8px; font-size: 14px; font-weight: 600; border: 1px solid var(--divider-color); background: var(--card-background-color); }
    .tab.active { border-color: var(--primary-color); background: var(--primary-color); color: var(--text-primary-color, #fff); }
    .points { display: flex; flex-direction: column; }
    .point { display: flex; align-items: center; gap: 12px; min-height: 56px; background: none; border: none; border-bottom: 1px solid var(--divider-color); padding: 0; text-align: left; }
    .ptime { font-size: 22px; font-weight: 600; width: 64px; font-variant-numeric: tabular-nums; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex: none; }
    .pname { flex: 1; font-size: 16px; }
    .ptemp { font-size: 15px; color: var(--secondary-text-color); }
    .savebar { display: flex; align-items: center; gap: 12px; padding-top: 4px; }
    .savebar span { flex: 1; font-size: 14px; color: var(--secondary-text-color); }
    .error { color: var(--error-color); font-size: 14px; }
    .backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.45); }
    .sheet { position: absolute; left: 0; right: 0; bottom: 0; background: var(--card-background-color); border-radius: 16px 16px 0 0; padding: 20px 16px 28px; box-sizing: border-box; max-height: 100%; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
    .timepick { display: flex; align-items: center; justify-content: center; gap: 16px; }
    .round { width: 56px; height: 56px; border-radius: 50%; border: 1.5px solid var(--primary-color); background: var(--card-background-color); color: var(--primary-color); font-size: 15px; font-weight: 600; }
    .timefield { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 12px; color: var(--secondary-text-color); }
    .timefield input { font-size: 36px; font-weight: 600; border: none; background: none; text-align: center; width: 150px; font-family: inherit; color: var(--primary-text-color); font-variant-numeric: tabular-nums; }
    fieldset.presets, div.presets { border: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    legend { font-size: 13px; color: var(--secondary-text-color); margin-bottom: 8px; padding: 0; }
    .preset { min-height: 52px; display: flex; align-items: center; gap: 10px; padding: 0 12px; border: 1px solid var(--divider-color); border-radius: 8px; box-sizing: border-box; }
    .preset.selected { border: 2px solid var(--primary-color); font-weight: 600; }
    .preset input { accent-color: var(--primary-color); }
    .holiday { display: flex; align-items: center; gap: 12px; min-height: 56px; border-top: 1px solid var(--divider-color); }
    .htext { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .htitle { font-size: 16px; font-weight: 600; }
    .hsub { font-size: 14px; color: var(--secondary-text-color); }
    .field { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: var(--secondary-text-color); }
    .field input { min-height: 44px; border: 1px solid var(--divider-color); border-radius: 8px; padding: 0 12px; font-size: 16px; font-family: inherit; color: var(--primary-text-color); background: var(--card-background-color); box-sizing: border-box; }
  `,customElements.define("toon-program-card",Tt);const Dt=window;Dt.customCards=Dt.customCards??[],Dt.customCards.push({type:"toon-program-card",name:$t(document.documentElement.lang||"en").cardName,description:$t(document.documentElement.lang||"en").cardDescription});export{Tt as ToonProgramCard};
