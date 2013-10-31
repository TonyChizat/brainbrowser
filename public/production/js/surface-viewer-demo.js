/*
 * Copyright (C) 2011 McGill University
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* brainbrowser v0.9.0 */
$(function(){"use strict";var a=0,b="",c=$("#loading");return BrainBrowser.utils.webglEnabled()?(BrainBrowser.SurfaceViewer.start("brainbrowser",function(d){d.clamped=!0,d.flip=!1,d.addEventListener("loadspectrum",function(a){var b=a.createSpectrumCanvasWithScale(0,100,null),c=document.getElementById("color-bar");b.id="spectrum-canvas",c?$(c).html(b):$('<div id="color-bar"></div>').html(b).appendTo("#data-range-box"),d.spectrumObj=a}),d.addEventListener("displayobject",function(a){var b,c,e=a.children,f=$("#shapes").children().length;e.length-f>0&&e.slice(f).forEach(function(a,e){c=$('<div id="shape_'+e+'" class="shape">'+"<h4>Shape "+(e+1+f)+"</h4>"+"Name: "+a.name+"<br />"+"Opacity: "+"</div>"),b=$('<div class="opacity-slider slider"  data-shape-name="'+a.name+'"></div>'),b.slider({value:100,min:-1,max:101,slide:function(a){var b=a.target,c=$(b).attr("data-shape-name"),e=$(b).slider("value");e=Math.min(100,Math.max(0,e))/100,d.changeShapeTransparency(c,e)}}),b.appendTo(c),c.appendTo("#shapes")})}),d.addEventListener("clearscreen",function(){$("#shapes").html(""),$("#data-range-box").hide()}),d.addEventListener("rangechange",function(a,b){$("#data-range-min").val(a),$("#data-range-max").val(b);var c=d.spectrumObj.createSpectrumCanvasWithScale(a,b,null);c.id="spectrum-canvas",$("#color-bar").html($(c))}),d.addEventListener("loaddata",function(a,b,e,f){function g(a){c.show();var b=$("#data-range-min").val(),e=$("#data-range-max").val();$(a.target).siblings(".slider").slider("values",0,b),$(a.target).siblings(".slider").slider("values",1,e),d.rangeChange(b,e,$(a.target).siblings("#clamp_range").is(":checked"),{afterUpdate:function(){c.hide()}})}var h=$("#data-range"),i='<div id="data-range-multiple"><ul>',j="";e=Array.isArray(e)?e:[e];var k,l;for(h.html(""),k=0,l=e.length;l>k;k++)i+='<li><a href="#data_file'+k+'">'+e[k].fileName+"</a></li>",j+='<div id="data_file'+k+'" class="box">',j+='Min: <input class="range-box" id="data-range-min" type="text" name="range_min" size="5" >',j+='<div id="range-slider+'+k+'" data-blend-index="'+k+'" class="slider"></div>',j+='Max: <input class="range-box" id="data-range-max" type="text" name="range_max" size="5" >',j+='<input type="checkbox" class="button" id="fix_range"><label for="fix_range">Fix Range</label>',j+='<input type="checkbox" class="button" id="clamp_range" checked="true"><label for="clamp_range">Clamp range</label>',j+='<input type="checkbox" class="button" id="flip_range"><label for="flip_range">Flip Colors</label>',j+="</div>";i+="</ul>",h.html(i+j+"</div>"),$("#data-range-box").show(),h.find("#data-range-multiple").tabs(),$("#data-range").find(".slider").each(function(a,b){var f=BrainBrowser.utils.min(e[0].values),g=BrainBrowser.utils.max(e[0].values);$(b).slider({range:!0,min:f,max:g,values:[e[a].rangeMin,e[a].rangeMax],step:(g-f)/100,slide:function(a,b){$("#data-range-min").val(b.values[0]),$("#data-range-max").val(b.values[1])},stop:function(a,b){c.show(),e[0].rangeMin=b.values[0],e[0].rangeMax=b.values[1],d.model_data.data=e[0],d.rangeChange(e[0].rangeMin,e[0].rangeMax,d.clamped,{afterUpdate:function(){c.hide()}})}})}),$("#data-range-min").change(g),$("#data-range-max").change(g),$("#fix_range").click(function(a){d.fixRange=$(a.target).is(":checked")}),$("#clamp_range").change(function(a){var b=parseFloat($(a.target).siblings("#data-range-min").val()),c=parseFloat($(a.target).siblings("#data-range-max").val());$(a.target).is(":checked")?d.rangeChange(b,c,!0):d.rangeChange(b,c,!1)}),$("#flip_range").change(function(a){d.flip=$(a.target).is(":checked"),c.show(),d.updateColors(d.model_data.data,{min:d.model_data.data.rangeMin,max:d.model_data.data.rangeMax,spectrum:d.spectrum,flip:d.flip,clamped:d.clamped,afterUpdate:function(){c.hide()}})}),f||($("#range-slider").slider("values",0,parseFloat(a)),$("#range-slider").slider("values",1,parseFloat(b)),d.triggerEvent("rangechange",a,b))}),d.addEventListener("blenddata",function(){var a=$("#blend-box");a.html("Blend Ratio: "),$('<span id="blend_value">0.5</span>').appendTo(a),$('<div class="blend_slider" id="blend_slider" width="100px" + height="10"></div>').slider({min:.1,max:.99,value:.5,step:.01,slide:function(){var a=$(this);a.siblings("span").html(a.slider("value"))},stop:function(){d.blend($(this).slider("value"))}}).appendTo(a)}),d.loadSpectrumFromUrl("/assets/spectral_spectrum.txt"),$("#clearshapes").click(function(){d.clearScreen(),a=0,b="",c.hide()}),$("#range-slider").slider({range:!0,min:-50,max:50,value:[-10,10],slider:function(a,b){var c=parseFloat(b.values[0]),e=parseFloat(b.values[1]);d.rangeChange(c,e,$("#clamp_range").is(":checked"))},step:.1}),$(".range-box").keypress(function(a){"13"===a.keyCode&&d.rangeChange(parseFloat($("#data-range-min").val()),parseFloat($("#data-range-max").val()))}),$("#examples").click(function(e){function f(b){return function(){return b!==a}}function g(){c.hide()}a++;var h,i,j=$(e.target).attr("data-example-name");if(b!==j){b=j,c.show(),d.clearScreen();var k={basic:function(){d.loadModelFromUrl("/models/surf_reg_model_both.obj",{format:"MNIObject",afterDisplay:g,cancel:f(a)})},punkdti:function(){d.loadModelFromUrl("/models/dti.obj",{format:"MNIObject",renderDepth:999,afterDisplay:g,cancel:f(a)}),d.loadModelFromUrl("/models/left_color.obj",{format:"MNIObject",cancel:f(a)}),d.loadModelFromUrl("/models/right_color.obj",{format:"MNIObject",cancel:f(a)})},realct:function(){d.loadModelFromUrl("/models/realct.obj",{format:"MNIObject",afterDisplay:function(){d.loadDataFromUrl("/models/realct.txt","Cortical Thickness",{afterUpdate:g,cancel:f(a)})},cancel:f(a)})},car:function(){d.loadModelFromUrl("/models/car.obj",{format:"WavefrontObj",afterDisplay:g,cancel:f(a)}),d.setCamera(0,0,100),h=new THREE.Matrix4,h.makeRotationX(-.25*Math.PI),i=new THREE.Matrix4,i.makeRotationY(.4*Math.PI),d.model.applyMatrix(i.multiply(h))},plane:function(){d.loadModelFromUrl("/models/dlr_bigger.streamlines.obj",{format:"MNIObject",cancel:f(a)}),d.loadModelFromUrl("/models/dlr.model.obj",{format:"MNIObject",afterDisplay:function(){g()},cancel:f(a)}),d.setCamera(0,0,75),h=new THREE.Matrix4,h.makeRotationX(-.25*Math.PI),i=new THREE.Matrix4,i.makeRotationY(.4*Math.PI),d.model.applyMatrix(i.multiply(h))},mouse:function(){d.loadModelFromUrl("/models/mouse_surf.obj",{format:"MNIObject",afterDisplay:function(){d.loadDataFromUrl("/models/mouse_alzheimer_map.txt","Cortical Amyloid Burden, Tg AD Mouse, 18 Months Old",{shape:"mouse_surf.obj",min:0,max:.25,afterUpdate:g,cancel:f(a)})},cancel:f(a)}),d.loadModelFromUrl("/models/mouse_brain_outline.obj",{format:"MNIObject",afterDisplay:function(){$(".opacity-slider[data-shape-name='mouse_brain_outline.obj']").slider("value",50),d.changeShapeTransparency("mouse_brain_outline.obj",.5)},cancel:f(a)}),d.setCamera(0,0,40)}};return k.hasOwnProperty(j)&&k[j](),!1}}),$("#obj_file_format").change(function(){var a=$("#obj_file_format").closest("#obj_file_select").find("#obj_file_format option:selected").val();$("#format_hint").html(BrainBrowser.filetypes.config[a].format_hint||"")}),$("#obj_file_submit").click(function(){var a=$("#obj_file_format").closest("#obj_file_select").find("#obj_file_format option:selected").val();return d.loadModelFromFile(document.getElementById("objfile"),{format:a,beforeLoad:function(){c.show()},afterDisplay:function(){c.hide()},onError:function(){c.hide()}}),!1}),$(".datafile").change(function(){var a=parseInt(this.id.slice(-1),10);d.loadDataFromFile(this,{blend_index:a-1})}),$("#spectrum").change(function(){d.loadSpectrumFromFile(document.getElementById("spectrum"))}),$("a.example[data-example-name=realct]").click()}),void 0):($("#brainbrowser").html(BrainBrowser.utils.webGLErrorMessage()),void 0)});