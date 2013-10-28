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

// Plugin for UI functionality used by both
// surface viewer and macacc.
BrainBrowser.SurfaceViewer.plugins.ui = function(viewer) {
  "use strict";
  
    
  $("body").keydown(function(e) {
    var key_code = e.which;
    var keys = {
      38: function() { viewer.ZoomInOut(1/1.1); },
      40: function() { viewer.ZoomInOut(1.1); },
      32: function() { viewer.separateHemispheres(); }
    };
  
    if (key_code in keys) {
      keys[key_code]();
      return false;
    }
  
    return true; // If we got here, key was not captured.
  });
  
  $("#clear_color").change(function(e){
    viewer.updateClearColor(parseInt($(e.target).val(), 16));
  });
  
  //Setups the view events and handlers
  $('#resetview').click(viewer.setupView);
  $('.view_button').change(viewer.setupView);
  $('[name=hem_view]').change(viewer.setupView);
  
  $('#meshmode').change(function(e) {
    if ($(e.target).is(":checked")) {
      viewer.set_fill_mode_wireframe();
    } else {
      viewer.set_fill_mode_solid();
    }
  });
  
  $('#threedee').change(function(e) {
    if ($(e.target).is(":checked")) {
      viewer.anaglyphEffect();
    } else {
      viewer.noEffect();
    }
  });
  
  $("#openImage").click(function() {
    var view_window = viewer.view_window;
    var canvas = document.createElement("canvas");
    var spectrum_canvas = document.getElementById("spectrum-canvas");
    var context = canvas.getContext("2d");
    var img = new Image();
    
    canvas.width = view_window.offsetWidth;
    canvas.height = view_window.offsetHeight;
  
    function displayImage() {
      var img = new Image();
      
      img.onload = function() {
        $("<div></div>").append(img).dialog({
          title: "Screenshot",
          height: img.height,
          width: img.width
        });
      };
      
      img.src = canvas.toDataURL();
    }
  
    function getSpectrumImage() {
      var img = new Image();
      img.onload = function(){
        context.drawImage(img, 0, 0); // Or at whatever offset you like
        displayImage();
      };
      img.src = spectrum_canvas.toDataURL();
    }
      
    img.onload = function(){
      context.drawImage(img, 0, 0); // Or at whatever offset you like
      if (spectrum_canvas) {
        getSpectrumImage();
      } else {
        displayImage();
      }
    };
    
    img.src = viewer.canvasDataURL();
  });
  
  viewer.getViewParams = function() {
    return {
      view: $('[name=hem_view]:checked').val(),
      left: $('#left_hem_visible').is(":checked"),
      right: $('#right_hem_visible').is(":checked")
    };
  };
  
  $("#autorotate-controls").children().change(function () {
    viewer.autoRotate.x = $("#autorotateX").is(":checked");
    viewer.autoRotate.y = $("#autorotateY").is(":checked");
    viewer.autoRotate.z = $("#autorotateZ").is(":checked");
  });
    
    
};
