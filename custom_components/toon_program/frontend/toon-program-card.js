/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),n=new WeakMap;let s=class{constructor(t,e,n){if(this._$cssResult$=!0,n!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const i=this.t;if(e&&void 0===t){const e=void 0!==i&&1===i.length;e&&(t=n.get(i)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&n.set(i,t))}return t}toString(){return this.cssText}};const o=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new s("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:a,defineProperty:r,getOwnPropertyDescriptor:l,getOwnPropertyNames:c,getOwnPropertySymbols:d,getPrototypeOf:h}=Object,p=globalThis,u=p.trustedTypes,g=u?u.emptyScript:"",m=p.reactiveElementPolyfillSupport,f=(t,e)=>t,y={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},v=(t,e)=>!a(t,e),$={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:v};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),p.litPropertyMetadata??=new WeakMap;let _=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),n=this.getPropertyDescriptor(t,i,e);void 0!==n&&r(this.prototype,t,n)}}static getPropertyDescriptor(t,e,i){const{get:n,set:s}=l(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:n,set(e){const o=n?.call(this);s?.call(this,e),this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const t=h(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const t=this.properties,e=[...c(t),...d(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(o(t))}else void 0!==t&&e.push(o(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((i,n)=>{if(e)i.adoptedStyleSheets=n.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of n){const n=document.createElement("style"),s=t.litNonce;void 0!==s&&n.setAttribute("nonce",s),n.textContent=e.cssText,i.appendChild(n)}})(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),n=this.constructor._$Eu(t,i);if(void 0!==n&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:y).toAttribute(e,i.type);this._$Em=t,null==s?this.removeAttribute(n):this.setAttribute(n,s),this._$Em=null}}_$AK(t,e){const i=this.constructor,n=i._$Eh.get(t);if(void 0!==n&&this._$Em!==n){const t=i.getPropertyOptions(n),s="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:y;this._$Em=n;const o=s.fromAttribute(e,t.type);this[n]=o??this._$Ej?.get(n)??o,this._$Em=null}}requestUpdate(t,e,i,n=!1,s){if(void 0!==t){const o=this.constructor;if(!1===n&&(s=this[t]),i??=o.getPropertyOptions(t),!((i.hasChanged??v)(s,e)||i.useDefault&&i.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:n,wrapped:s},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==s||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===n&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,n=this[e];!0!==t||this._$AL.has(e)||void 0===n||this.C(e,void 0,i,n)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};_.elementStyles=[],_.shadowRootOptions={mode:"open"},_[f("elementProperties")]=new Map,_[f("finalized")]=new Map,m?.({ReactiveElement:_}),(p.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const b=globalThis,x=t=>t,w=b.trustedTypes,k=w?w.createPolicy("lit-html",{createHTML:t=>t}):void 0,A="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,E="?"+S,T=`<${E}>`,C=document,D=()=>C.createComment(""),O=t=>null===t||"object"!=typeof t&&"function"!=typeof t,z=Array.isArray,M="[ \t\n\f\r]",P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,H=/-->/g,U=/>/g,N=RegExp(`>|${M}(?:([^\\s"'>=/]+)(${M}*=${M}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,V=/"/g,R=/^(?:script|style|textarea|title)$/i,I=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),L=Symbol.for("lit-noChange"),B=Symbol.for("lit-nothing"),W=new WeakMap,F=C.createTreeWalker(C,129);function K(t,e){if(!z(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==k?k.createHTML(e):e}const q=(t,e)=>{const i=t.length-1,n=[];let s,o=2===e?"<svg>":3===e?"<math>":"",a=P;for(let e=0;e<i;e++){const i=t[e];let r,l,c=-1,d=0;for(;d<i.length&&(a.lastIndex=d,l=a.exec(i),null!==l);)d=a.lastIndex,a===P?"!--"===l[1]?a=H:void 0!==l[1]?a=U:void 0!==l[2]?(R.test(l[2])&&(s=RegExp("</"+l[2],"g")),a=N):void 0!==l[3]&&(a=N):a===N?">"===l[0]?(a=s??P,c=-1):void 0===l[1]?c=-2:(c=a.lastIndex-l[2].length,r=l[1],a=void 0===l[3]?N:'"'===l[3]?V:j):a===V||a===j?a=N:a===H||a===U?a=P:(a=N,s=void 0);const h=a===N&&t[e+1].startsWith("/>")?" ":"";o+=a===P?i+T:c>=0?(n.push(r),i.slice(0,c)+A+i.slice(c)+S+h):i+S+(-2===c?e:h)}return[K(t,o+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),n]};class Z{constructor({strings:t,_$litType$:e},i){let n;this.parts=[];let s=0,o=0;const a=t.length-1,r=this.parts,[l,c]=q(t,e);if(this.el=Z.createElement(l,i),F.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(n=F.nextNode())&&r.length<a;){if(1===n.nodeType){if(n.hasAttributes())for(const t of n.getAttributeNames())if(t.endsWith(A)){const e=c[o++],i=n.getAttribute(t).split(S),a=/([.?@])?(.*)/.exec(e);r.push({type:1,index:s,name:a[2],strings:i,ctor:"."===a[1]?X:"?"===a[1]?tt:"@"===a[1]?et:Q}),n.removeAttribute(t)}else t.startsWith(S)&&(r.push({type:6,index:s}),n.removeAttribute(t));if(R.test(n.tagName)){const t=n.textContent.split(S),e=t.length-1;if(e>0){n.textContent=w?w.emptyScript:"";for(let i=0;i<e;i++)n.append(t[i],D()),F.nextNode(),r.push({type:2,index:++s});n.append(t[e],D())}}}else if(8===n.nodeType)if(n.data===E)r.push({type:2,index:s});else{let t=-1;for(;-1!==(t=n.data.indexOf(S,t+1));)r.push({type:7,index:s}),t+=S.length-1}s++}}static createElement(t,e){const i=C.createElement("template");return i.innerHTML=t,i}}function G(t,e,i=t,n){if(e===L)return e;let s=void 0!==n?i._$Co?.[n]:i._$Cl;const o=O(e)?void 0:e._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),void 0===o?s=void 0:(s=new o(t),s._$AT(t,i,n)),void 0!==n?(i._$Co??=[])[n]=s:i._$Cl=s),void 0!==s&&(e=G(t,s._$AS(t,e.values),s,n)),e}class J{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,n=(t?.creationScope??C).importNode(e,!0);F.currentNode=n;let s=F.nextNode(),o=0,a=0,r=i[0];for(;void 0!==r;){if(o===r.index){let e;2===r.type?e=new Y(s,s.nextSibling,this,t):1===r.type?e=new r.ctor(s,r.name,r.strings,this,t):6===r.type&&(e=new it(s,this,t)),this._$AV.push(e),r=i[++a]}o!==r?.index&&(s=F.nextNode(),o++)}return F.currentNode=C,n}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class Y{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,n){this.type=2,this._$AH=B,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=G(this,t,e),O(t)?t===B||null==t||""===t?(this._$AH!==B&&this._$AR(),this._$AH=B):t!==this._$AH&&t!==L&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>z(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==B&&O(this._$AH)?this._$AA.nextSibling.data=t:this.T(C.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,n="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Z.createElement(K(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===n)this._$AH.p(e);else{const t=new J(n,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=W.get(t.strings);return void 0===e&&W.set(t.strings,e=new Z(t)),e}k(t){z(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,n=0;for(const s of t)n===e.length?e.push(i=new Y(this.O(D()),this.O(D()),this,this.options)):i=e[n],i._$AI(s),n++;n<e.length&&(this._$AR(i&&i._$AB.nextSibling,n),e.length=n)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=x(t).nextSibling;x(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class Q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,n,s){this.type=1,this._$AH=B,this._$AN=void 0,this.element=t,this.name=e,this._$AM=n,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=B}_$AI(t,e=this,i,n){const s=this.strings;let o=!1;if(void 0===s)t=G(this,t,e,0),o=!O(t)||t!==this._$AH&&t!==L,o&&(this._$AH=t);else{const n=t;let a,r;for(t=s[0],a=0;a<s.length-1;a++)r=G(this,n[i+a],e,a),r===L&&(r=this._$AH[a]),o||=!O(r)||r!==this._$AH[a],r===B?t=B:t!==B&&(t+=(r??"")+s[a+1]),this._$AH[a]=r}o&&!n&&this.j(t)}j(t){t===B?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class X extends Q{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===B?void 0:t}}class tt extends Q{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==B)}}class et extends Q{constructor(t,e,i,n,s){super(t,e,i,n,s),this.type=5}_$AI(t,e=this){if((t=G(this,t,e,0)??B)===L)return;const i=this._$AH,n=t===B&&i!==B||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,s=t!==B&&(i===B||n);n&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class it{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){G(this,t)}}const nt=b.litHtmlPolyfillSupport;nt?.(Z,Y),(b.litHtmlVersions??=[]).push("3.3.3");const st=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class ot extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const n=i?.renderBefore??e;let s=n._$litPart$;if(void 0===s){const t=i?.renderBefore??null;n._$litPart$=s=new Y(e.insertBefore(D(),t),t,void 0,i??{})}return s._$AI(t),s})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return L}}ot._$litElement$=!0,ot.finalized=!0,st.litElementHydrateSupport?.({LitElement:ot});const at=st.litElementPolyfillSupport;at?.({LitElement:ot}),(st.litElementVersions??=[]).push("4.2.2");const rt=1430,lt=[1,2,3,4,5,6,0];function ct(t){return lt[t]}function dt(t){const e=/^(\d{2}):(\d{2})$/.exec(t);if(!e)throw new Error(`invalid time: ${t}`);return 60*Number(e[1])+Number(e[2])}function ht(t){const e=Math.floor(t/60),i=t%60;return`${String(e).padStart(2,"0")}:${String(i).padStart(2,"0")}`}function pt(t,e){return ht(Math.min(rt,Math.max(0,dt(t)+e)))}function ut(t){if(0===t.length)return"12:00";const e=new Set(t.map(t=>dt(t.time))),i=Math.max(...e),n=60*(Math.floor(i/60)+1);if(n<=rt&&!e.has(n))return ht(n);for(let t=0;t<=rt;t+=10)if(!e.has(t))return ht(t);throw new Error("no free time slot left")}function gt(t){return void 0!==t&&"unavailable"!==t.state&&Array.isArray(t.attributes.days)&&"program_hash"in t.attributes}function mt(t,e){return`${t.toLocaleString(e,{minimumFractionDigits:1,maximumFractionDigits:1})}°`}function ft(t){return String(t).padStart(2,"0")}function yt(t){return`${t.getFullYear()}-${ft(t.getMonth()+1)}-${ft(t.getDate())}T${ft(t.getHours())}:${ft(t.getMinutes())}`}const vt={title:"Weekprogramma",on:"Aan",now:"Nu",at:"om",to:"naar",tapDay:"Tik op een dag om de tijden aan te passen.",vacation:"Vakantie",back:"Terug",addTime:"Tijd toevoegen",copyTo:"Kopieer naar…",save:"Opslaan",saving:"Opslaan…",unsaved:"Wijziging op {day} nog niet opgeslagen",discardConfirm:"De wijziging op {day} is nog niet opgeslagen. Weggooien?",copyHint:"Sla eerst je wijziging op om te kopiëren.",done:"Klaar",fromDay:"{day}, vanaf",time:"Tijd",earlier:"10 minuten eerder",later:"10 minuten later",preset:"Stand",removeBlock:"Dit blok verwijderen",readOnlyState:"Deze stand kan hier niet gewijzigd worden.",copyTitle:"Kopieer {day} naar",copyAction:"Kopiëren",cancel:"Annuleren",planned:"Gepland",noVacation:"Geen vakantie gepland.",newVacation:"Nieuwe vakantie",from:"Van",until:"Tot",vacationTemp:"Temperatuur tijdens vakantie",scheduleVacation:"Vakantie inplannen",changeVacation:"Vakantie wijzigen",saveVacation:"Wijziging opslaan",removeVacation:"Vakantie verwijderen",noEntity:"Geen Toon-programma gevonden. Stel de entiteit in de kaartconfiguratie in.",unreachable:"Toon niet bereikbaar",reload:"Opnieuw laden",rangeTo:"tot",presets:{0:"Comfort",1:"Thuis",2:"Slapen",3:"Weg",4:"Vakantie"},daysShort:["Ma","Di","Wo","Do","Vr","Za","Zo"],daysLong:["maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag","zondag"],errors:{program_state_failed:"Het programma kon niet worden aangepast: {error}",program_changed:"Het programma is op de Toon gewijzigd. Ververs en probeer opnieuw.",write_not_applied:"De Toon heeft de wijziging niet overgenomen.",cannot_connect:"De Toon is niet bereikbaar.",empty_week:"Het programma moet minstens één tijd bevatten.",duplicate_time:"Twee tijden op hetzelfde moment.",invalid_time:"Ongeldige tijd.",invalid_state:"Ongeldige stand.",end_before_start:"Het einde van de vakantie moet na het begin liggen.",invalid_device:"Dit apparaat hoort niet bij Toon Program.",unknown_vacation:"Deze vakantie bestaat niet (meer) op de Toon."},cardName:"Toon weekprogramma",cardDescription:"Bekijk en bewerk het weekprogramma van je Toon."},$t={title:"Week program",on:"On",now:"Now",at:"at",to:"to",tapDay:"Tap a day to edit its times.",vacation:"Vacation",back:"Back",addTime:"Add time",copyTo:"Copy to…",save:"Save",saving:"Saving…",unsaved:"Change on {day} not saved yet",discardConfirm:"The change on {day} is not saved yet. Discard it?",copyHint:"Save your change first to copy.",done:"Done",fromDay:"{day}, from",time:"Time",earlier:"10 minutes earlier",later:"10 minutes later",preset:"Preset",removeBlock:"Remove this block",readOnlyState:"This preset cannot be changed here.",copyTitle:"Copy {day} to",copyAction:"Copy",cancel:"Cancel",planned:"Planned",noVacation:"No vacation planned.",newVacation:"New vacation",from:"From",until:"Until",vacationTemp:"Temperature during vacation",scheduleVacation:"Schedule vacation",changeVacation:"Change vacation",saveVacation:"Save change",removeVacation:"Remove vacation",noEntity:"No Toon program found. Set the entity in the card configuration.",unreachable:"Toon not reachable",reload:"Reload",rangeTo:"to",presets:{0:"Comfort",1:"Home",2:"Sleep",3:"Away",4:"Vacation"},daysShort:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],daysLong:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],errors:{program_state_failed:"Could not change the program state: {error}",program_changed:"The program was changed on the Toon. Refresh and try again.",write_not_applied:"The Toon did not accept the change.",cannot_connect:"Cannot connect to the Toon.",empty_week:"The program must contain at least one time.",duplicate_time:"Two times at the same moment.",invalid_time:"Invalid time.",invalid_state:"Invalid state.",end_before_start:"The end of the vacation must be after the start.",invalid_device:"This device does not belong to Toon Program.",unknown_vacation:"This vacation no longer exists on the Toon."},cardName:"Toon week program",cardDescription:"View and edit the week program of your Toon."};function _t(t){return t.toLowerCase().startsWith("nl")?vt:$t}function bt(t,e){return t.replace(/\{(\w+)\}/g,(t,i)=>{if(!(i in e))throw new Error(`missing placeholder ${i}`);return e[i]})}const xt=["comfort","home","sleep","away","vacation"],wt={0:"#c4561f",1:"#f2b04a",2:"#27407a",3:"#a9b0b8",4:"#6b8f71"};function kt(t,e){const i=e.translation_key?t.errors[e.translation_key]:void 0;return void 0===i?e.message??String(e):bt(i,e.translation_placeholders??{})}function At(t,e,i,n){const s=function(t,e,i){const n=[...i].sort((t,e)=>dt(t.time)-dt(e.time)),s=[];let o=e,a=0;for(const t of n){const e=dt(t.time);e>a&&s.push({state:o,fromMin:a,toMin:e}),o=t.state,a=e}return s.push({state:o,fromMin:a,toMin:1440}),s}(0,t,e);return I`<span class="bar" style="height:${i}px;border-radius:${n}px">
    ${s.map(t=>I`<span
          style="flex:0 0 ${((t.toMin-t.fromMin)/1440*100).toFixed(2)}%;background:${wt[t.state]}"
        ></span>`)}
  </span>`}function St(t){return t?I`<div class="error" role="alert">${t}</div>`:""}function Et(t,e){const i=new Date(t);return`${i.toLocaleDateString(e,{weekday:"short",day:"numeric",month:"short"})} ${i.toLocaleTimeString(e,{hour:"2-digit",minute:"2-digit",hour12:!1})}`}function Tt(t){const{t:e,attrs:i}=t,n=xt.indexOf(t.stateKey),s=e=>mt(i.states[String(e)],t.lang),o=i.next_state?xt.indexOf(i.next_state):-1;return I`
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
    ${n>=0?I`<div class="sub">
          ${e.now} <strong>${e.presets[String(n)]} ${s(n)}</strong>${i.next_time&&o>=0?I`, ${e.at} ${a=i.next_time,r=t.lang,new Date(a).toLocaleTimeString(r,{hour:"2-digit",minute:"2-digit",hour12:!1})} ${e.to} ${e.presets[String(o)]} ${s(o)}`:""}
        </div>`:""}
    <div class="weekbars">
      <div class="axis"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
      ${e.daysShort.map((e,n)=>{const s=i.days[ct(n)];return I`<button type="button" class="dayrow" @click=${()=>t.onDay(n)}>
          <span class="daylabel">${e}</span>
          ${At(s.carry_in,s.points,28,6)}
        </button>`})}
    </div>
    <div class="legend">
      ${[0,1,2,3].map(t=>I`<span><i style="background:${wt[t]}"></i>${e.presets[String(t)]}
            ${s(t)}</span>`)}
    </div>
    <div class="row">
      <button type="button" class="outline" @click=${t.onVacation}>${e.vacation}</button>
    </div>
    <div class="hint">${e.tapDay}</div>
  `;var a,r}class Ct extends ot{constructor(){super(...arguments),this._view="week",this._uiDay=0,this._draft=null,this._draftHash="",this._editIdx=null,this._copySel=new Set,this._copyOpen=!1,this._busy=!1,this._error=null,this._conflict=!1,this._vac=null}setConfig(t){this._config=t}getCardSize(){return 6}static getStubConfig(){return{}}attrs(t){const e=this.hass.states[t];if(!e)throw new Error(`entity not found: ${t}`);return e.attributes}deviceId(t){const e=this.hass.entities[t]?.device_id;if(!e)throw new Error(`no device for ${t}`);return e}switchId(t){const e=this.deviceId(t),i=Object.keys(this.hass.entities).find(t=>t.startsWith("switch.")&&this.hass.entities[t].device_id===e&&"toon_program"===this.hass.entities[t].platform);if(!i)throw new Error("program switch entity not found");return i}async call(t,e,i){this._busy=!0,this._error=null,this._conflict=!1;try{return await this.hass.callService("toon_program",t,{device_id:this.deviceId(i),...e}),!0}catch(t){const e=t;return this._error=kt(_t(this.hass.language),e),this._conflict="program_changed"===e.translation_key,!1}finally{this._busy=!1}}async toggle(t,e,i){this._error=null;try{await this.hass.callService("switch",e?"turn_on":"turn_off",{entity_id:this.switchId(t)})}catch(t){i.checked=!e,this._error=kt(_t(this.hass.language),t)}}reload(){this._draft=null,this._editIdx=null,this._error=null,this._conflict=!1}selectDay(t){this._uiDay=t,this._error=null,this._view="day"}tab(t){if(t!==this._uiDay){if(this._draft){const t=_t(this.hass.language);if(!window.confirm(bt(t.discardConfirm,{day:t.daysLong[this._uiDay]})))return;this._draft=null}this.selectDay(t)}}points(t){return this._draft??this.attrs(t).days[ct(this._uiDay)].points}setDraft(t,e){this._draft||(this._draftHash=this.attrs(t).program_hash),this._draft=e}async save(t){if(!this._draft)return;await this.call("set_day",{day:ct(this._uiDay),points:this._draft,program_hash:this._draftHash},t)&&(this._draft=null,this._editIdx=null)}async copy(t){await this.call("copy_day",{source:ct(this._uiDay),targets:[...this._copySel].map(ct),program_hash:this.attrs(t).program_hash},t)&&(this._copyOpen=!1,this._copySel=new Set)}vac(t){return this._vac?this._vac:function(t,e,i){const n=String(e);if(t.length>0)return{from:yt(new Date(t[0].start)),to:yt(new Date(t[0].end)),temp:n};const s=new Date(i);s.setMinutes(0,0,0),s.setHours(s.getHours()+1);const o=new Date(s.getTime()+864e5);return{from:yt(s),to:yt(o),temp:n}}(t.holidays,t.vacation_temperature,new Date)}async scheduleVacation(t,e){const i=this.vac(e);await this.call("set_vacation",{start:`${i.from}:00`,end:`${i.to}:00`,temperature:Number(i.temp)},t)&&(this._vac=null)}willUpdate(t){t.has("_view")&&(this._error=null)}render(){if(!this.hass||!this._config)return I``;const t=_t(this.hass.language),e=this.hass.language,i=function(t,e,i){if(i)return i in t?gt(t[i])?{kind:"ok",id:i}:{kind:"unavailable",id:i}:{kind:"none"};const n=Object.keys(e).filter(t=>t.startsWith("sensor.")&&"toon_program"===e[t].platform),s=n.find(e=>gt(t[e]));return s?{kind:"ok",id:s}:n.length>0?{kind:"unavailable",id:n[0]}:{kind:"none"}}(this.hass.states,this.hass.entities,this._config.entity);if("none"===i.kind)return I`<ha-card><div class="body hint">${t.noEntity}</div></ha-card>`;if("unavailable"===i.kind)return I`<ha-card><div class="body error" role="alert">${t.unreachable}</div></ha-card>`;const n=i.id,s=this.attrs(n),o=this.hass.states[n].state;let a,r=B;if("vacation"===this._view){const i=this.vac(s);a=function(t){const{t:e}=t,i=t.attrs.holidays.length>0,n=(e,i,n,s,o)=>I`
    <label class="field">${e}
      <input type=${i} step=${o??""} .value=${n} @input=${e=>t.onField(s,e.target.value)} />
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
              <span class="htitle">${Et(i.start,t.lang)} ${e.rangeTo} ${Et(i.end,t.lang)}</span>
              <span class="hsub">${e.presets[4]}, ${mt(t.attrs.vacation_temperature,t.lang)}</span>
            </div>
            <button type="button" class="icon danger" aria-label=${e.removeVacation} ?disabled=${t.busy} @click=${()=>t.onRemove(i.entry_id)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path></svg>
            </button>
          </div>`)}
    <h2>${i?e.changeVacation:e.newVacation}</h2>
    ${n(e.from,"datetime-local",t.from,"from")}
    ${n(e.until,"datetime-local",t.to,"to")}
    ${n(e.vacationTemp,"number",t.temp,"temp","0.5")}
    ${St(t.error)}
    <button type="button" class="primary wide" ?disabled=${t.busy||!t.from||!t.to||!t.temp} @click=${t.onSubmit}>${i?e.saveVacation:e.scheduleVacation}</button>
  `}({t:t,lang:e,attrs:s,...i,busy:this._busy,error:this._error,onField:(t,e)=>this._vac={...i,[t]:e},onSubmit:()=>{this.scheduleVacation(n,s)},onRemove:t=>{this.call("remove_vacation",{entry_id:t},n)},onBack:()=>this._view="week"})}else if("day"===this._view){const i=s.days[ct(this._uiDay)],o=this.points(n);if(a=function(t){const{t:e}=t,i=t.points.map((t,e)=>({pt:t,index:e})).sort((t,e)=>dt(t.pt.time)-dt(e.pt.time));return I`
    <div class="head">
      <button type="button" class="back" aria-label=${e.back} @click=${t.onBack}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>
      </button>
      <h1>${e.title}</h1>
    </div>
    <div class="tabs">
      ${e.daysShort.map((e,i)=>I`<button type="button" class="tab ${i===t.uiDay?"active":""}" @click=${()=>t.onTab(i)}>${e}</button>`)}
    </div>
    ${At(t.day.carry_in,t.points,12,4)}
    <div class="points">
      ${i.map(({pt:i,index:n})=>I`<button type="button" class="point" @click=${()=>t.onEdit(n)}>
          <span class="ptime">${i.time}</span>
          <i class="dot" style="background:${wt[i.state]}"></i>
          <span class="pname">${e.presets[String(i.state)]}</span>
          <span class="ptemp">${mt(t.attrs.states[String(i.state)],t.lang)}</span>
        </button>`)}
    </div>
    <div class="row">
      <button type="button" class="outline" @click=${t.onAdd}>${e.addTime}</button>
      <button type="button" class="outline" ?disabled=${t.dirty} title=${t.dirty?e.copyHint:""} @click=${t.onCopy}>${e.copyTo}</button>
    </div>
    ${St(t.error)}
    ${t.error&&t.conflict?I`<button type="button" class="outline" @click=${t.onReload}>${e.reload}</button>`:""}
    ${t.dirty?I`<div class="savebar">
          <span>${bt(e.unsaved,{day:e.daysLong[t.uiDay]})}</span>
          <button type="button" class="primary" ?disabled=${t.saving} @click=${t.onSave}>${t.saving?e.saving:e.save}</button>
        </div>`:""}
  `}({t:t,lang:e,attrs:s,uiDay:this._uiDay,day:i,points:o,dirty:null!==this._draft,saving:this._busy,error:this._copyOpen||null!==this._editIdx?null:this._error,onTab:t=>this.tab(t),onEdit:t=>this._editIdx=t,onAdd:()=>{try{this.setDraft(n,[...o,{time:ut(o),state:1}]),this._editIdx=o.length}catch(t){this._error=function(t){return t instanceof Error?t.message:String("object"==typeof t&&null!==t&&"message"in t?t.message:t)}(t)}},onCopy:()=>{this._error=null,this._copyOpen=!0},onSave:()=>{this.save(n)},conflict:this._conflict,onReload:()=>this.reload(),onBack:()=>{if(this._draft){if(!window.confirm(bt(t.discardConfirm,{day:t.daysLong[this._uiDay]})))return;this._draft=null}this._view="week"}}),null!==this._editIdx&&o[this._editIdx]){const i=this._editIdx;r=function(t){const{t:e,point:i}=t,n=4===i.state;return I`
    <div class="backdrop" @click=${t.onClose}></div>
    <div class="sheet" role="dialog">
      <div class="head">
        <h1>${bt(e.fromDay,{day:e.daysLong[t.uiDay].replace(/^./,t=>t.toUpperCase())})}</h1>
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
            @change=${e=>{const n=e.target.value;n&&t.onChange({...i,time:n})}}
          />
        </label>
        <button type="button" class="round" aria-label=${e.later} @click=${()=>t.onChange({...i,time:pt(i.time,10)})}>+10</button>
      </div>
      ${n?I`<div class="hint">${e.presets[4]}: ${e.readOnlyState}</div>`:I`<fieldset class="presets">
            <legend>${e.preset}</legend>
            ${[0,1,2,3].map(n=>I`<label class="preset ${i.state===n?"selected":""}">
                <input
                  type="radio"
                  name="state"
                  .checked=${i.state===n}
                  @change=${()=>t.onChange({...i,state:n})}
                />
                <i class="dot" style="background:${wt[n]}"></i>
                ${e.presets[String(n)]} ${mt(t.attrs.states[String(n)],t.lang)}
              </label>`)}
          </fieldset>`}
      ${n?"":I`<button type="button" class="danger" @click=${t.onDelete}>${e.removeBlock}</button>`}
    </div>
  `}({t:t,lang:e,attrs:s,uiDay:this._uiDay,point:o[i],onChange:t=>this.setDraft(n,o.map((e,n)=>n===i?t:e)),onDelete:()=>{this.setDraft(n,o.filter((t,e)=>e!==i)),this._editIdx=null},onClose:()=>this._editIdx=null})}else this._copyOpen&&(r=function(t){const{t:e}=t;return I`
    <div class="backdrop" @click=${t.onClose}></div>
    <div class="sheet" role="dialog">
      <div class="head"><h1>${bt(e.copyTitle,{day:e.daysLong[t.uiDay]})}</h1></div>
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
      ${St(t.error)}
      <div class="row">
        <button type="button" class="outline" @click=${t.onClose}>${e.cancel}</button>
        <button type="button" class="primary" ?disabled=${t.busy||0===t.selected.size} @click=${t.onConfirm}>${e.copyAction}</button>
      </div>
    </div>
  `}({t:t,uiDay:this._uiDay,selected:this._copySel,busy:this._busy,error:this._error,onToggle:(t,e)=>{const i=new Set(this._copySel);e?i.add(t):i.delete(t),this._copySel=i},onConfirm:()=>{this.copy(n)},onClose:()=>this._copyOpen=!1}))}else a=Tt({t:t,lang:e,attrs:s,stateKey:o,onToggle:(t,e)=>{this.toggle(n,t,e)},onDay:t=>this.selectDay(t),onVacation:()=>this._view="vacation"});return I`<ha-card class=${r===B?"":"sheet-open"}><div class="body">${a}${"week"===this._view&&this._error?I`<div class="error" role="alert">${this._error}</div>`:B}</div>${r}</ha-card>`}}Ct.properties={hass:{attribute:!1},_config:{state:!0},_view:{state:!0},_uiDay:{state:!0},_draft:{state:!0},_draftHash:{state:!0},_editIdx:{state:!0},_copySel:{state:!0},_copyOpen:{state:!0},_busy:{state:!0},_error:{state:!0},_conflict:{state:!0},_vac:{state:!0}},Ct.styles=((t,...e)=>{const n=1===t.length?t[0]:e.reduce((e,i,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[n+1],t[0]);return new s(n,t,i)})`
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
  `,customElements.define("toon-program-card",Ct);const Dt=window;Dt.customCards=Dt.customCards??[],Dt.customCards.push({type:"toon-program-card",name:_t(document.documentElement.lang||"en").cardName,description:_t(document.documentElement.lang||"en").cardDescription});export{Ct as ToonProgramCard};
