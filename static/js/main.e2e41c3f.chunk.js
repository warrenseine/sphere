(this.webpackJsonpsphere=this.webpackJsonpsphere||[]).push([[0],{53:function(e,t,r){},55:function(e,t,r){},59:function(e,t,r){"use strict";r.r(t);var n=r(3),c=r.n(n),o=r(35),a=r.n(o),i=(r(52),r(53),r(14)),s=r(7),b=r(10),l=r(46),u=r(32),j=r(61),d=r(64),O=r(65),f=r(62),h=r(63),p=r(17),m=r(42),g=r(41),v=r(26),w=r(0);r(55);function y(e){var t=Object(n.useState)(!1),r=Object(b.a)(t,2),c=r[0],o=r[1],a=Object(n.useCallback)((function(t){t.keyCode===e&&o(!0)}),[e]),i=Object(n.useCallback)((function(t){t.keyCode===e&&o(!1)}),[e]);return Object(n.useEffect)((function(){return window.addEventListener("keydown",a),window.addEventListener("keyup",i),function(){window.removeEventListener("keydown",a),window.removeEventListener("keyup",i)}}),[a,i]),c}var x=r(15),k=Object(v.b)({key:"player",default:{orbitOffset:new w.Vector3}}),E=Object(v.b)({key:"ball",default:[],dangerouslyAllowMutability:!0}),S=0;var C=["rgb(249, 65, 68)","rgb(243, 114, 44)","rgb(248, 150, 30)","rgb(249, 199, 79)","rgb(144, 190, 109)","rgb(67, 170, 139)","rgb(87, 117, 144)"];function L(e){var t=Object(u.c)((function(){return{args:1,mass:1,type:"Static"}})),r=Object(b.a)(t,1)[0];return Object(x.jsxs)("mesh",Object(s.a)(Object(s.a)({},e),{},{ref:r,receiveShadow:!0,children:[Object(x.jsx)("sphereGeometry",{args:[1,32,32]}),Object(x.jsx)("meshToonMaterial",{attach:"material",color:"hotpink"})]}))}function M(e){var t=y(g.a),r=y(g.b),c=Object(n.useRef)(null),o=Object(n.useRef)(null),a=Object(v.c)(k),f=Object(b.a)(a,2),h=f[0],m=f[1],L=[1,.2,.1],M=Object(u.b)((function(){return{args:L,mass:1,position:[0,0,4],rotation:[Math.PI,0,0],type:"Static",onCollide:Q}})),V=Object(b.a)(M,2),A=V[0],I=V[1],z=Object(v.e)(E),P=Object(l.useSpring)({to:{distort:0},from:{distort:.4},config:{duration:1500}}).distort,Q=Object(n.useCallback)((function(e){P.reset()}),[P]);return function(e,t){var r=Object(n.useCallback)((function(r){r.keyCode===e&&t()}),[e,t]);Object(n.useEffect)((function(){return window.addEventListener("keypress",r),function(){window.removeEventListener("keypress",r)}}),[r])}(g.c,(function(){var e=A.current.getWorldDirection(new w.Vector3).normalize().multiplyScalar(-1),t=e.clone().multiplyScalar(1.5),r=A.current.getWorldPosition(new w.Vector3).add(e),n=++S,c=function(e){return C[e%C.length]}(n),o={angularVelocity:new w.Euler,velocity:t,position:r,color:c,ballId:n};z((function(e){return[].concat(Object(i.a)(e),[o]).slice(-3)}))})),Object(p.b)((function(e,n){var c=new w.Vector3(0,t?-1:r?1:0,0),o=h.orbitOffset.clone().addScaledVector(c,n);m({orbitOffset:o})})),Object(p.b)((function(e,t){var r=new w.Quaternion;r.setFromAxisAngle(new w.Vector3(0,1,0),h.orbitOffset.y);var n=new w.Euler;n.setFromQuaternion(r),I.rotation.copy(n);var c=new w.Vector3(0,0,4).applyQuaternion(r);I.position.copy(c)})),Object(n.useEffect)((function(){var e=A.current;return e.addEventListener("collide",Q),function(){return e.removeEventListener("collide",Q)}}),[A,Q]),Object(x.jsx)("group",Object(s.a)(Object(s.a)({ref:c},e),{},{children:Object(x.jsxs)(j.a,{args:L,radius:.05,smoothness:8,ref:A,receiveShadow:!0,children:[Object(x.jsx)("meshPhongMaterial",{attach:"material",color:"#f3f3f3"}),Object(x.jsx)(d.a,{color:"orange",attach:"material",distort:P.get(),speed:10}),Object(x.jsx)(O.a,{makeDefault:!0,ref:o,position:[0,1,2],rotation:[-Math.PI/16,0,0]})]})}))}function V(e){var t=Object(v.d)(E);return Object(x.jsx)("group",Object(s.a)(Object(s.a)({},e),{},{children:t.map((function(e){return Object(x.jsx)(A,{ball:e},e.ballId)}))}))}function A(e){var t=e.ball,r=Object(u.c)((function(){return{args:.2,mass:1,position:t.position.toArray(),velocity:t.velocity.toArray()}})),n=Object(b.a)(r,1)[0];return Object(x.jsxs)("mesh",Object(s.a)(Object(s.a)({},e),{},{ref:n,scale:.2,castShadow:!0,children:[Object(x.jsx)("sphereGeometry",{args:[1,16,16]}),Object(x.jsx)("meshToonMaterial",{attach:"material",color:t.color})]}))}function I(){return Object(x.jsxs)(p.a,{style:{backgroundColor:"#121212"},shadows:!0,children:[Object(x.jsx)(v.a,{children:Object(x.jsxs)(u.a,{gravity:[0,0,0],defaultContactMaterial:{friction:0,restitution:1},children:[Object(x.jsx)("ambientLight",{}),Object(x.jsx)("pointLight",{position:[30,10,10],castShadow:!0,"shadow-mapSize-width":4096,"shadow-mapSize-height":4096}),Object(x.jsx)(V,{}),Object(x.jsx)(L,{position:[0,0,0]}),Object(x.jsx)(M,{position:[0,0,0]})]})}),Object(x.jsxs)(m.a,{multisampling:0,children:[Object(x.jsx)(m.b,{active:!0,ratio:.85}),Object(x.jsx)(h.a,{radius:100,depth:50,count:5e3,factor:4,saturation:0,fade:!0}),Object(x.jsx)(m.c,{eskil:!1,offset:.1,darkness:1.1})]})]})}Object(f.a)({frustum:3.75,size:.005,near:9.5,samples:17,rings:11}),a.a.render(Object(x.jsx)(c.a.StrictMode,{children:Object(x.jsx)(I,{})}),document.getElementById("root"))}},[[59,1,2]]]);
//# sourceMappingURL=main.e2e41c3f.chunk.js.map