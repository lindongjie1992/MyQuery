/* 
 *  练习用途,许多功能未添加
 */
 
function addEvent(obj,oEvent,fn){ // 绑定事件
	if(obj.addEventListener){
		obj.addEventListener(oEvent,function(ev){
			if(fn.call(obj) == false){
				ev.preventDefault();
				ev.cancelBubble = true;
			}
		},false);
	} else {
		obj.attachEvent('on' + oEvent,function(){
			if(fn.call(obj) == false){
				window.event.cancelBubble = true;
				return false;
			};
		});
	}
}

function getByClass(oParent,sClass){ //通过class获取元素
	var arr = [];
	var elm = oParent.getElementsByTagName('*');
	var re = new RegExp('\\b' + sClass + '\\b');
	for(var i = 0; i < elm.length; i++){
		if( re.test(elm[i].className) ){
			arr.push(arr[i]);
		}
	}
	return arr;
}

function toArray(elm){ //集合转数组
	var arr = [];
	for(var i = 0; i < elm.length; i++){
		arr.push(elm[i]);
	}
	return arr;
}

function getCss(obj,attr){ //设置、获取样式
	if(obj.currentStyle){
		return obj.currentStyle[attr];
	} else {
		return getComputedStyle(obj,false)[attr];
	}
}

function hasClass(obj, cls) { //判断是否存在class
    return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}

function addClass(obj, cls) { //添加class
	if (!hasClass(obj, cls)) {
		obj.className += " " + cls;
	}
}

function removeClass(obj, cls) { //删除class
	if (hasClass(obj, cls)) {
		var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
		obj.className = obj.className.replace(reg, ' ');
	}
}

function myQuery(vStr){
	this.elemts = [];
	switch(typeof vStr){
		case 'function' :
			addEvent(window,'load',vStr);
		break;
		case 'string':
			this.elemts = Sizzle(vStr);
		break;
		case 'object' :
			if(vStr.constructor == Array){
				this.elemts = vStr;
			} else {
				this.elemts.push(vStr);
			}
		break;
	}
	
}

myQuery.prototype.css = function(key,val){
	for(var i = 0; i < this.elemts.length; i++){
		if(arguments.length == 2){
			this.elemts[i].style[key] = val;
		} else if(arguments.length == 1) {
			if(typeof key == 'object'){
				for(var attr in key){
					this.elemts[i].style[attr] = key[attr];
				}
			} else {
				return getCss(this.elemts[i],key);
			}
		}
	}
	return this;
}

myQuery.prototype.html = function(str){
	for(var i = 0; i < this.elemts.length; i++){
		if(str){
			this.elemts[i].innerHTML = str;
		} else {
			return this.elemts[i].innerHTML;
		}
	}
	return this;
}

myQuery.prototype.on = function(oEvent,fn){
	for(var i = 0; i < this.elemts.length; i++){
		addEvent(this.elemts[i],oEvent,fn);
	}
	
	return this;
}

myQuery.prototype.click = function(fn){
	this.on('click',fn);
	return this;
}

myQuery.prototype.hover = function(fn1,fn2){
	this.on('mouseover',fn1);
	this.on('mouseout',fn2);
	return this;
}

myQuery.prototype.eq = function(num){
	return $(this.elemts[num])
}

myQuery.prototype.index = function(){
	var elm = this.elemts[0];
	var oParent = elm.parentNode.children
	for(var i = 0; i < oParent.length; i++){
		if(oParent[i] === elm){
			return i;
		}
	}
	return this;
}

myQuery.prototype.addClass = function(sClass){
	for(var i = 0; i < this.elemts.length; i++){
		addClass(this.elemts[i],sClass);
	}
	return this;
}


myQuery.prototype.find = function(sel){
	var arr = [];
	if(sel.charAt(0) == '.'){
		for(var i = 0; i < this.elemts.length; i++){
			arr = arr.concat(getByClass(this.elemts[i],sel.substring(1)));
		}
	} else {
		for(var i = 0; i < this.elemts.length; i++){
			arr = arr.concat(toArray(this.elemts[i].getElementsByTagName(sel)))
		}
	}
	return $(arr);
}


myQuery.prototype.animate = function(json,times,fx,fn){
	for(var i = 0; i < this.elemts.length; i++){
		startMove(this.elemts[i],json,times,fx,fn);
	}
	return this;
}

myQuery.prototype.js = function(){
	for(var i = 0; i < this.elemts.length; i++){
		return this.elemts[i];
	}
}

myQuery.prototype.jq = function(elm){
	var arr = [];
	for(var i = 0; i < elm.length; i++){
		arr.push(elm[i]);
	}
	this.elemts = arr;
	return this;
}


function startMove(obj,json,times,fx,fn){
	
	if( typeof times == 'undefined' ){
		times = 400;
		fx = 'linear';
	}
	
	if( typeof times == 'string' ){
		if(typeof fx == 'function'){
			fn = fx;
		}
		fx = times;
		times = 400;
	}
	else if(typeof times == 'function'){
		fn = times;
		times = 400;
		fx = 'linear';
	}
	else if(typeof times == 'number'){
		if(typeof fx == 'function'){
			fn = fx;
			fx = 'linear';
		}
		else if(typeof fx == 'undefined'){
			fx = 'linear';
		}
	}
	
	var iCur = {};
	
	for(var attr in json){
		iCur[attr] = 0;
		
		if( attr == 'opacity' ){
			iCur[attr] = Math.round(getStyle(obj,attr)*100);
		}
		else{
			iCur[attr] = parseInt(getStyle(obj,attr));
		}
		
	}
	
	var startTime = now();
	
	clearInterval(obj.timer);
	
	obj.timer = setInterval(function(){
		
		var changeTime = now();
		
		var t = times - Math.max(0,startTime - changeTime + times);  //0到2000
		
		for(var attr in json){
			
			var value = Tween[fx](t,iCur[attr],parseInt(json[attr])-iCur[attr],times);
			
			if(attr == 'opacity'){
				obj.style.opacity = value/100;
				obj.style.filter = 'alpha(opacity='+value+')';
			}
			else{
				obj.style[attr] = value + 'px';
			}
			
		}
		
		if(t == times){
			clearInterval(obj.timer);
			if(fn){
				fn.call(obj);
			}
		}
		
	},13);
	
	function getStyle(obj,attr){
		if(obj.currentStyle){
			return obj.currentStyle[attr];
		}
		else{
			return getComputedStyle(obj,false)[attr];
		}
	}
	
	function now(){
		return (new Date()).getTime();
	}
	
}

var Tween = {  //Tween运动公式  t当前时间 b初始值 c改变的值 d所需时间
	linear: function (t, b, c, d){  //匀速
		return c*t/d + b;
	},
	easeIn: function(t, b, c, d){  //加速曲线
		return c*(t/=d)*t + b;
	},
	easeOut: function(t, b, c, d){  //减速曲线
		return -c *(t/=d)*(t-2) + b;
	},
	easeBoth: function(t, b, c, d){  //加速减速曲线
		if ((t/=d/2) < 1) {
			return c/2*t*t + b;
		}
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInStrong: function(t, b, c, d){  //加加速曲线
		return c*(t/=d)*t*t*t + b;
	},
	easeOutStrong: function(t, b, c, d){  //减减速曲线
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeBothStrong: function(t, b, c, d){  //加加速减减速曲线
		if ((t/=d/2) < 1) {
			return c/2*t*t*t*t + b;
		}
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	elasticIn: function(t, b, c, d, a, p){  //正弦衰减曲线（弹动渐入）
		if (t === 0) { 
			return b; 
		}
		if ( (t /= d) == 1 ) {
			return b+c; 
		}
		if (!p) {
			p=d*0.3; 
		}
		if (!a || a < Math.abs(c)) {
			a = c; 
			var s = p/4;
		} else {
			var s = p/(2*Math.PI) * Math.asin (c/a);
		}
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	elasticOut: function(t, b, c, d, a, p){    //正弦增强曲线（弹动渐出）
		if (t === 0) {
			return b;
		}
		if ( (t /= d) == 1 ) {
			return b+c;
		}
		if (!p) {
			p=d*0.3;
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p/(2*Math.PI) * Math.asin (c/a);
		}
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},    
	elasticBoth: function(t, b, c, d, a, p){
		if (t === 0) {
			return b;
		}
		if ( (t /= d/2) == 2 ) {
			return b+c;
		}
		if (!p) {
			p = d*(0.3*1.5);
		}
		if ( !a || a < Math.abs(c) ) {
			a = c; 
			var s = p/4;
		}
		else {
			var s = p/(2*Math.PI) * Math.asin (c/a);
		}
		if (t < 1) {
			return - 0.5*(a*Math.pow(2,10*(t-=1)) * 
					Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		}
		return a*Math.pow(2,-10*(t-=1)) * 
				Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
	},
	backIn: function(t, b, c, d, s){     //回退加速（回退渐入）
		if (typeof s == 'undefined') {
		   s = 1.70158;
		}
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	backOut: function(t, b, c, d, s){
		if (typeof s == 'undefined') {
			s = 3.70158;  //回缩的距离
		}
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	}, 
	backBoth: function(t, b, c, d, s){
		if (typeof s == 'undefined') {
			s = 1.70158; 
		}
		if ((t /= d/2 ) < 1) {
			return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		}
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	bounceIn: function(t, b, c, d){    //弹球减振（弹球渐出）
		return c - Tween['bounceOut'](d-t, 0, c, d) + b;
	},       
	bounceOut: function(t, b, c, d){
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
		}
		return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
	},      
	bounceBoth: function(t, b, c, d){
		if (t < d/2) {
			return Tween['bounceIn'](t*2, 0, c, d) * 0.5 + b;
		}
		return Tween['bounceOut'](t*2-d, 0, c, d) * 0.5 + c*0.5 + b;
	}
}


function $(vStr){
	return new myQuery(vStr);
}
