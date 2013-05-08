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


var g_spectrum;

//for Picking



function MacaccObject(brainbrowser, path, dont_build_path) {
  var that = this;
  this.brainbrowser = brainbrowser;
  this.dataSet = new Dataset(path,dont_build_path);

  //Defining constants I will use
  that.debugLineGroup;
  that.debugLine;
  that.selectedInfo = null;
  that.treeInfo;  // information about the transform graph.
  that.pickInfoElem;
  that.flashTimer = 0;
  that.highlightMaterial;
  that.highlightShape;
  that.vertex;
  that.positionVector;
  that.primitiveIndex;
  that.dataArray;
  that.data_max; //Max of data
  that.data_min; //Min of data
  that.range_max; //Max of range bar
  that.range_min; //Min of range bar
  that.spectrum;
  that.coordinates = jQuery("#coordinates");
  that.selectPoint = null;

  function setVertexCoord(vertex_data, value) {
    var vertex = vertex_data.vertex;
    if (vertex != undefined && value != undefined) {
      jQuery("#x-coord").val(vertex_data.point.x);
      jQuery("#y-coord").val(vertex_data.point.y);
      jQuery("#z-coord").val(vertex_data.point.z);
      jQuery("#v-coord").val(vertex);
      jQuery("#value-coord").val(value);
    }
  }


  //Gets the data related to a vertex in the image.
  this.pickClick = function(e, vertex_data) {
    that.vertex = vertex_data.vertex;
    
    if (vertex_data.object && vertex_data.object.model_num) {
      that.vertex += vertex_data.object.model_num * vertex_data.object.geometry.vertices.length;
    } 
   
    if(that.vertex) {
      update_map();
      setVertexCoord(vertex_data, 0);
      if(brainbrowser.secondWindow != undefined && true) {
	      brainbrowser.secondWindow.postMessage(that.vertex,"*");
      }
    }else {
      jQuery(that.pickInfoElem).html('--nothing--');
    }
  };
  
  this.change_model = function(event) {
    var type = jQuery(event.target).val();

    brainbrowser.loadObjFromUrl('/data/surfaces/surf_reg_model_both_'+type+'.obj');
  };

  this.flipXCoordinate = function() {
    if (!that.dataArray) return;
    
    if(that.vertex > that.dataArray.length/2) {
      that.vertex -= that.dataArray.length/2;
    }else {
      that.vertex += that.dataArray.length/2;
    }
    setVertexCoord(brainbrowser.getInfoForVertex(that.vertex), 0);
    update_map();
  };

  //Finds out what the value is at a certain point and displays it
  this.valueAtPoint = function(e, vertex_data) {
    var value = that.dataArray[vertex_data.vertex];
    setVertexCoord(vertex_data, value);
  };


  /**
   * This method applies the colors to the model
   */
  // function update_colors(color_array) {
  //   if(brainbrowser.model_data.num_hemispheres == 1) {
  //     var color_buffer = brainbrowser.pack.createObject('VertexBuffer');
  //     var color_field = color_buffer.createField('FloatField', 4);
  //     color_buffer.set(color_array);
  //     var brain_shape = brainbrowser.brainTransform.shapes[0];
  //     var stream_bank = brain_shape.elements[0].streamBank;
  //     stream_bank.setVertexStream(
  //        brainbrowser.o3d.Stream.COLOR, //  This stream stores vertex positions
  //        0,                     // First (and only) position stream
  //        color_field,        // field: the field this stream uses.
  //        0);                    // start_index:
  // 
  // 
  //   } else {
  //     var left_color_array = color_array.slice(0, color_array.length/2);
  //     var right_color_array = color_array.slice(color_array.length/2, color_array.length);
  // 
  //     var left_color_buffer = brainbrowser.pack.createObject('VertexBuffer');
  //     var left_color_field = left_color_buffer.createField('FloatField', 4);
  //     left_color_buffer.set(left_color_array);
  //     var left_brain_shape = brainbrowser.brainTransform.children[0].shapes[0];
  //     var left_stream_bank = left_brain_shape.elements[0].streamBank;
  //     left_stream_bank.setVertexStream(
  //        brainbrowser.o3d.Stream.COLOR, //  This stream stores vertex positions
  //        0,                     // First (and only) position stream
  //        left_color_field,        // field: the field this stream uses.
  //        0);                    // start_index:
  // 
  // 
  // 
  //     var right_color_buffer = brainbrowser.pack.createObject('VertexBuffer');
  //     var right_color_field = right_color_buffer.createField('FloatField', 4);
  //     right_color_buffer.set(right_color_array);
  //     var right_brain_shape = brainbrowser.brainTransform.children[1].shapes[0];
  //     var right_stream_bank = right_brain_shape.elements[0].streamBank;
  //     right_stream_bank.setVertexStream(
  //       brainbrowser.o3d.Stream.COLOR, //  This stream stores vertex positions
  //       0,                     // First (and only) position stream
  //       right_color_field,        // field: the field this stream uses.
  //       0);                    // start_index:
  //       brainbrowser.client.render();
  //   }
  // 
  // }

  function get_data_controls() {
    var data_modality = jQuery("[name=modality]:checked").val(); //CT,AREA or Volume
    var data_sk = jQuery("#data-sk").val(); //Smoothing Kernel
    var data_statistic = jQuery("[name=statistic]:checked").val();


    return {modality: data_modality, sk: data_sk, statistic: data_statistic };
  }

  function update_color_map(min, max, flip, clamped) {
      brainbrowser.updateColors(that.dataSet.current_data,min,max,brainbrowser.spectrum,flip,clamped);
  }


  function update_model(dataset) {
    that.dataArray = dataset.current_data.values;
    brainbrowser.current_dataset = dataset;
    if(jQuery("#fix_range").attr("checked") == true) {
      if(!(that.data_min = parseFloat(jQuery("#data-range-min").val()))) {
	      if(!that.data_min === 0 ) {
	        that.data_min = dataset.current_data.min;
	      }
      }
      if(!(that.data_max = parseFloat(jQuery("#data-range-max").val()))) {
	      if(!that.data_max === 0 ) {
	        that.data_max = dataset.current_data.max;
	      }
      }
    } else if(get_data_controls().statistic == "T") {
      that.data_min = dataset.current_data.min;
      that.data_max = dataset.current_data.max;
    }

    var flip = jQuery("#flip_range").attr("checked");
    var clamped = jQuery("#clamp_range").attr("checked");
    if(get_data_controls().statistic == "T") {
      that.flipRange = flip;
      //jQuery("#range-slider").slider("option", "min", dataset.min);
      //jQuery("#range-slider").slider("option", "max", dataset.max);
      update_color_map(that.data_min, that.data_max,flip,clamped);
    }else {
      that.flipRange = !flip;
      jQuery("#range-slider").slider("option", "min", "0");
      jQuery("#range-slider").slider("option", "max", "1");
      update_color_map(0,1,!flip,clamped);
    }

  }

  that.update_model = update_model;

  function update_map() {

    that.dataSet.get_data(that.vertex, get_data_controls(), update_model);
    jQuery(that.pickInfoElem).html("Viewing data for vertex: " + that.vertex  );
    
  }

  this.show_atlas = function() {
    brainbrowser.loadDataFromUrl("/assets/aal_atlas.txt");
  };

  function update_range(min,max) {
    if(!jQuery("#fix_range").attr("checked")){
      jQuery("#data-range-min").val(min);
      jQuery("#data-range-max").val(max);
      jQuery("#range-slider").slider("values", 0, min);
      jQuery("#range-slider").slider("values", 1, max);


    }
    if(that.afterRangeChange != undefined) {
      that.afterRangeChange(min,max);
    }

  }

  function update_scale(min,max) {
  }

  this.range_change = function() {
    var min=parseFloat(jQuery("#data-range-min").val());
    var max=parseFloat(jQuery("#data-range-max").val());
    update_color_map(min,max,$("#flip_range").attr("checked"),$("#clamp_range").attr("checked"));

    if(that.afterRangeChange != undefined) {
      that.afterRangeChange(min,max);
    }
  };


  this.data_control_change = function() {
 
    var controls  = get_data_controls();
    if(controls.modality == "AAL"){
      that.show_atlas();
      
    }else if(that.vertex) {
      update_map();
    }
  };


  brainbrowser.loadSpectrumFromUrl("/assets/spectral_spectrum.txt");
  //brainbrowser.updateInfo();
  brainbrowser.valueAtPointCallback = this.valueAtPoint;
  brainbrowser.clickCallback = this.pickClick; //associating pickClick for brainbrowser which handles events.

}





