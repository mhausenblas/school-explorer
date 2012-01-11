/*
 * @category  UI interaction
 * @package   
 * @author    Michael Hausenblas <michael.hausenblas@deri.org>
 * @author    Sarven Capadisli <sarven.capadisli@deri.org>
 * @copyright Public Domain
 * @license   
 * @link      http://deri.ie/
 */


var SE = { // School Explorer

    C : { // constant SE-wide values
        DEBUG : false,

        SCHOOL_DATA_NS_URI : "http://data-gov.ie/school/", // the school data name space

        SCHOOL_LISTING_MODE : "SCHOOL LISTING", // render a list of schools; a particular school can be selected
        SCHOOL_DETAIL_MODE : "SCHOOL DETAIL", // render one school (note: requires the school URI, such as http://data-gov.ie/school/63000E)

        BASE_URI : "/map", // such as http://school-explorer.data-gov.ie/map on the server
        NEAR_API_BASE : "/near?center=", // such as near?center=53.2895,-9.0820&religion=Catholic&gender=Gender_Boys
        ENROLMENT_API_BASE : "/enrolment?school_id=", // such as enrolment?school_id=http%3A%2F%2Fdata-gov.ie%2Fschool%2F62210K
        AGEGROUPS_API_BASE : "/agegroups?school_id=", // such as agegroups?school_id=http%3A%2F%2Fdata-gov.ie%2Fschool%2F63000E
        INFO_API_BASE : "/info?school_id=", // such as info?school_id=http%3A%2F%2Fdata-gov.ie%2Fschool%2F62210K
        NEARBY_API_BASE : "/lgd_lookup?center=", // such as lgd_lookup?center=53.7724,-7.1632&radius=1000

        LINKEDGEODATA_API_BASE : "http://browser.linkedgeodata.org/?", // such as http://browser.linkedgeodata.org/?lat=53.289191332462&lon=-9.0729670467386&zoom=15

        MAX_SCHOOL_LISTING : 10, // determines how many schools are rendered below the map
        MAP_TYPE : google.maps.MapTypeId.ROADMAP, // the type of the map, see http://code.google.com/apis/maps/documentation/javascript/reference.html#MapTypeId

        CONTAINER_ELEMENT_ID : "content", // the @id of the overall container incl. the heading
        CONTAINER_INNER_ELEMENT_ID : "content_inner", // the @id of the inner container
        SCHOOLS_OVERVIEW_ELEMENT_ID : "schools_overview", // the @id of the school overview container
        RESULT_ELEMENT_ID : "school_results", // the @id of the legend
        LEGEND_ELEMENT_ID : "school_legend", // the @id of the legend
        MAP_ELEMENT_ID : "school_map", // the @id of the map
        SCHOOL_CONTEXT_ELEMENT_ID : "school_context", // the @id of the school context element (container for SV map and nearby)
        SV_MAP_ELEMENT_ID : "school_sv_map", // the @id of the SV map
        NEARBY_ELEMENT_ID : "school_nearby", // the @id of the nearby element
        NEARBY_SLIDER_ELEMENT_ID : "school_nearby_slider", // the @id of the nearby slider
        NEARBY_RADIUS_ELEMENT_ID : "school_nearby_radius", // the @id of the nearby radius
        SCHOOL_INFO_ELEMENT_CLASS : "school_info", // the @class of a school info window
        DEFAULT_SEARCH_RADIUS : 80, // default ...
        MIN_SEARCH_RADIUS : 50, // ... min ...
        MAX_SEARCH_RADIUS : 2000, // ... max radius for the search
        DETAILS_ELEMENT_ID : "school_details", // the @id of the details
        SCHOOL_LIST_ITEM_CLASS : "school_lst", // the @class of a school listing element 
        EXPAND_SCHOOL : "expand_school", // the @class of a 'expand school' element
        ADDRESS_FIELD_ID : "address", // the @id of the address input field
        DISTANCE_FIELD_ID : "distance", // the @id of the distance input field
        AGE_FIELD_ID : "age", // the @id of the distance input field
        RELIGION_FIELD_ID : "religion", // the @id of the religion input field
        GENDER_FIELD_ID : "gender", // the @id of the gender input field
        FINDSCHOOL_BTN_ID : "find_school", // the @id of the 'find school' button
        SHOW_MORE_SCHOOLS : "show_more_schools", // the @class of the 'show more schools' element
        CLOSE_ALL_INFO_WINDOW : "close_iw", // the @id of the 'close info window' element
        STOP_BOUNCE : "stop_bounce", // the @id of the 'stop bouncing' element
        SHOW_NEARBY : "show_nearby", // the @class of a show nearby element
        SCHOOL_ENROLMENT_ELEMENT_ID : "school_enrolment",
        AGEGROUPS_ELEMENT_ID : 'agegroups',

        MARKER_DYNAM_ID : "dynam", // the @id of the canvas we draw the dynamic markers in
        GM_MARKER_SIZE : { width: 16, height: 24 },

        SCHOOL_YEARS : {
            "http://data-gov.ie/number-of-pre-zero-students" : { label : "0", year: "pre_school", value : 0 },
            "http://data-gov.ie/number-of-pre-first-students" : { label : "1", year: "pre_school", value : 0 },
            "http://data-gov.ie/number-of-pre-second-students" : { label : "2", year: "pre_school", value : 0 },
            "http://data-gov.ie/number-of-pre-third-students" : { label : "3", year: "pre_school", value : 0 },

            "http://data-gov.ie/number-of-junior-infants-students" : { label : "J", year: "primary_school", value : 0 },
            "http://data-gov.ie/number-of-senior-infants-students" : { label : "S", year: "primary_school", value : 0 },
            "http://data-gov.ie/number-of-first-class-students" : { label : "1", year: "primary_school", value : 0 },
            "http://data-gov.ie/number-of-second-class-students" : { label : "2", year: "primary_school", value : 0 },
            "http://data-gov.ie/number-of-third-class-students" : { label : "3", year: "primary_school", value : 0 },
            "http://data-gov.ie/number-of-fourth-class-students" : { label : "4", year: "primary_school", value : 0 },
            "http://data-gov.ie/number-of-fifth-class-students" : { label : "5", year: "primary_school", value : 0 },
            "http://data-gov.ie/number-of-sixth-class-students" : { label : "6", year: "primary_school", value : 0 },

            //TODO: Rename 1st..5th to "first".."fifth" in store and update this.
            "http://data-gov.ie/number-of-1st-year-students" : { label : "1", year: "secondary_school", value : 0 },
            "http://data-gov.ie/number-of-2nd-year-students" : { label : "2", year: "secondary_school", value : 0 },
            "http://data-gov.ie/number-of-3rd-year-students" : { label : "3", year: "secondary_school", value : 0 },
            "http://data-gov.ie/number-of-TY-students" : { label : "T", year: "secondary_school", value : 0 },
            "http://data-gov.ie/number-of-5th-year-students" : { label : "5", year: "secondary_school", value : 0 },
            "http://data-gov.ie/number-of-6th-year-students" : { label : "6", year: "secondary_school", value : 0 }
        }
    },

    G : { // SE-wide values
        smap : null, // the google.maps.Map object
        smapWidth : 0.6, // the preferred width of the map
        smapHeight : 1, // the preferred height of the map
        selectedZoomFactor : 12, // keeps track of the selected zoom factor ( 7 ~ all Ireland, 10 - 12 ~ county-level, > 12 ~ village-level)
        genderCCodes : { 'boys' : '#11f', 'girls' : '#f6f', 'mixed' : '#fff' },
        religionCCodes : { 'catholic' : '#ff3', 'others' : '#fff' },
        slist : {}, // 'associative' array (school ID -> school)*
        mlist : {}, // 'associative' array (school ID -> marker)*
        iwlist : {}, // 'associative' array (school ID -> info window)*
        vlist : [], //  array of 'visited' schools (schoolID)*
        chartAPI : null, // the jgcharts object http://www.maxb.net/scripts/jgcharts
        contextRadius : 500, // in m ... used for querying the LGD POIs
        currentSchoolID : null, // selected school
        useMapBounds : true, //wheather to use the map's bounding coordinates for the query or not
    },

    I : {  }, // Input values

    // add general overview stats/diagram based on:
    // http://en.wikipedia.org/wiki/Category:Schools_in_the_Republic_of_Ireland and
    // http://en.wikipedia.org/wiki/National_school_%28Ireland%29

    // static rendering of schools and some examples ...
    renderSchoolOverview : function () {
        var tmp = $('<div id="' + SE.C.SCHOOLS_OVERVIEW_ELEMENT_ID +  '"/>');
        var tmpf = $('<div style="float:left;"/>');

        tmp.append('<h3>Overview</h3>');
        
        SE.G.chartAPI = new jGCharts.Api();

        // http://en.wikipedia.org/wiki/National_school_%28Ireland%29
        tmpf.append($('<img>').attr('src', SE.G.chartAPI.make({
            data : [3032, 183, 40, 14, 5, 2, 1, 1, 1, 1 ],
            title       : 'National schools in Ireland (2007)',
            title_color : '111',
            title_size  : 14,
            legend :  ['number of schools'],
            axis_labels : ["Catholic", "Church of Ireland", "Multi-denominational", "Presbyterian", "Inter-denominational", "Muslim", "Methodist", "Jewish", "Jehovah's Witnesses", "Quaker"],
            size : '400x130',
            type : 'p3',
            colors : ['339900']
        })));

        tmp.append(tmpf);
        tmpf = $('<div style="float:left; margin: 0 1em 0 0;"/>');
        // http://www.education.ie/servlet/blobservlet/stat_web_stats_09_10.pdf
        tmpf.append($('<img>').attr('src', SE.G.chartAPI.make({
            data : [31709, 13228, 8335, 3630, 610],
            title       : 'Teachers First and Second level (2009/2010)',
            title_color : '111',
            title_size  : 14,
            legend :  ['Number of Teachers'],
            axis_labels : ["Primary Teachers", "2nd level - Secondary", "2nd level - Vocational", "2nd level - Community", "2nd level - Comprehensive"],
            size : '400x130',
            type : 'p3',
            colors : ['003399']
        })));
        tmp.append(tmpf);
        
        tmp.append('<div style="clear:left; padding:2em; text-align:center; color: #a0a0a0;">&diams;</div><h3>Examples</h3>');
        // Galway, catholic, mixed:
        tmp.append('<div class="example_school"><a href="/school/63000E" target="_blank"><img src="/theme/base/images/illustrations/illu_ex1.png" alt="picture of Presentation Secondary School"/></a><p>Presentation Secondary School, Galway</p></div>');
        // Dublin, catholic, girls: - TODO: check why this is not working ....
        tmp.append('<div class="example_school"><a href="/school/60890C" target="_blank"><img src="/theme/base/images/illustrations/illu_ex2.png" alt="picture of St Louis High School"/></a><p>St Louis High School, Dublin 6</p></div>');

        $('#' + SE.C.CONTAINER_INNER_ELEMENT_ID).prepend(tmp);

    },

    // TODO: make legend filter-able

    init : function () {
        SE.initSearchPanel();
        SE.handleInteraction();
    },

    initSearchPanel : function () {
        $("#form_search #address").focus();
/*
        $("#form_search .form_guide").parent().hover(function () {
            $(this).css({position:"relative"});

            form_guide = $(this).find(".form_guide");
            form_guide.css({
                display: "block",
                position: "absolute",
                bottom: "-45px",
                left: "0",
                zIndex: "9",
                width: "430px",
                border: "1px solid #aaa",
                borderRadius: "7px",
                fontSize: "0.9",
                padding: "0.5em",
                background: "#fff"
            });
            return false;
        }, function () {
            form_guide.css({
                display: "none"
            })
            return false
        });
*/
        // the search button has been hit, show nearby schools
        $('#' + SE.C.FINDSCHOOL_BTN_ID).click(function () {
            SE.searchAction();
        });

        // the ENTER key has been hit in the address field, show nearby schools
        $('#' + SE.C.ADDRESS_FIELD_ID).keypress(function (e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            if (code == 13) {
                SE.searchAction();
            }
        });

        urlParams = SE.getURLParams();

        if (urlParams.address != undefined) {
            SE.setSchoolSearchValues(urlParams);
            SE.showSchools();
        }
    },

    searchAction : function () {
        if (window.location.pathname != '/'+SE.C.BASE_URI) {
            SE.getSchoolSearchValues();

            var urlParams = $.param({
                'address' : SE.I.SCHOOL_ADDRESS,
                'distance' : SE.I.SCHOOL_DISTANCE,
                'age' : SE.I.SCHOOL_AGE,
                'religion' : SE.I.SCHOOL_RELIGION,
                'gender' : SE.I.SCHOOL_GENDER
            });

            window.location = SE.C.BASE_URI + '?' + urlParams;
        }

        SE.showSchools();
    },

    initNearbyPanel : function () {
        SE.showSchoolContext();

        $('#' + SE.C.NEARBY_SLIDER_ELEMENT_ID).slider({
                value: SE.C.DEFAULT_SEARCH_RADIUS,
                min: SE.C.MIN_SEARCH_RADIUS,
                max: SE.C.MAX_SEARCH_RADIUS,
                slide: function (event, ui) {
                    SE.G.contextRadius =  ui.value; // get the current selected slider value (== search radius for nearby POIs in meter)
                    $('#' + SE.C.NEARBY_RADIUS_ELEMENT_ID).html("<h3>Nearby</h3>Showing nearby things closer than <strong>" + ui.value + "m</strong>:");
                },
                change: function (event, ui) {
                    if (SE.G.currentSchoolID) { // update context of current selected school
                        SE.showSchoolContext(SE.G.currentSchoolID);
                    }
                }
        });
        $('#' + SE.C.NEARBY_RADIUS_ELEMENT_ID).html("<h3>Nearby</h3>Showing nearby things closer than <strong>" + SE.C.DEFAULT_SEARCH_RADIUS + "m</strong>:");
    },


    initLegendPanel : function () {
        var buf = ["<div class='sublegend'><h2>Gender</h2>"];
        $.each(SE.G.genderCCodes, function (index, val) {
            buf.push("<div style='background:" + SE.G.genderCCodes[index] +";'>" + index + "</div>");
        });
        buf.push("</div><div class='sublegend'><h2>Religion</h2>");
        $.each(SE.G.religionCCodes, function (index, val) {
            buf.push("<div style='background:" + SE.G.religionCCodes[index] +";'>" + index + "</div>");
        });
        buf.push("</div>");
        $('#' + SE.C.LEGEND_ELEMENT_ID).html(buf.join(""));
    },

    //From http://stackoverflow.com/a/2880929
    getURLParams : function () {
        var urlParams = {};
        var e,
            a = /\+/g,  // Regex for replacing addition symbol with a space
            r = /([^&=]+)=?([^&]*)/g,
            d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
            q = window.location.search.substring(1);

        while (e = r.exec(q)) {
           urlParams[d(e[1])] = d(e[2]);
        }

        return urlParams;
    },

    replaceURIsHost : function (uri, host) {
        getLocation = function (uri) {
            l = document.createElement("a");
            l.href = uri;
            return l;
        }

        l = getLocation(uri);

        //I rebuild for 1337 points (or maybe because I don't know better)
        return l.protocol + '//' + host + l.port + l.pathname + l.search + l.hash;
    },

    handleInteraction : function () {
        // on window resize, fit map
        $(window).resize(function () { 
            $('#' + SE.C.MAP_ELEMENT_ID).width($('#' + SE.C.CONTAINER_ELEMENT_ID).width() * SE.G.smapWidth);
        });

        // show the hidden school infos ...
        $('#' + SE.C.SHOW_MORE_SCHOOLS).live('click', function () {
            $('.' + SE.C.SCHOOL_LIST_ITEM_CLASS + '.hidden').each(function (index) {
                $(this).removeClass('hidden');
            });
            $(this).html("");
            // we're at the top, so scroll to the bottom
            $.scrollTo('#' + SE.C.DETAILS_ELEMENT_ID, {duration : 500});
        });

        // expand school listing item, let the associated marker bounce and show context
        $('.' + SE.C.SCHOOL_LIST_ITEM_CLASS).live('click', function () {
            var schoolID = $(this).attr('about');
            var el = $(this);
            SE.G.currentSchoolID = schoolID;

            // show 'stop bouncing'
            $('#' + SE.C.STOP_BOUNCE).show();

            // we're potentially far away, hence scroll back to top
            $.scrollTo('#' + SE.C.RESULT_ELEMENT_ID, {duration : 500});
            
            // show the context of the school (street view and nearby POIs)
//            SE.showSchoolContext(schoolID);

            // stop bouncing of all markers and start bouncing of associated marker:
            $.each(SE.G.mlist, function (sID, marker) {
                 marker.setAnimation(null);
            });
            SE.G.mlist[schoolID].setAnimation(google.maps.Animation.BOUNCE);

            // activate associated info window via school look-up table
            SE.renderSchool(SE.G.slist[schoolID], function (iwcontent) {
                var s = SE.G.slist[schoolID];
                SE.G.iwlist[s["school"].value] = SE.addSchoolInfo(s["school"].value, SE.G.mlist[schoolID], iwcontent); // remember info windows indexed by school ID
            });

            // handle first time visit via listing
            if ($.inArray(schoolID, SE.G.vlist) < 0 ) { // school has not yet been visited via listing
                // get school's enrolments and display totals as well as mark school listing item as visited
                $.getJSON(SE.C.ENROLMENT_API_BASE + encodeURIComponent(schoolID), function (data, textStatus) {
                    var total = 0;
                    $.each(data.data, function (i, grade) {
                        total = total + parseInt(grade.numberOfStudents.value);
                    });
                    // replace  'More ...' with details about school
                    $('.' + SE.C.EXPAND_SCHOOL, el).html("<div>Pupils: " + total + "</div>");
                    $('.' + SE.C.EXPAND_SCHOOL, el).css('font-size', '8pt');
                    // mark school visited:
                    el.css('background-image', 'url(/theme/base/images/icons/icon_checkmark.png)');
                    el.css('background-position', 'top right');
                    el.css('background-repeat', 'no-repeat');
                    el.css('color', '#aeaeae');
                    el.css('box-shadow', 'none');
                    SE.G.vlist.push(schoolID);  // add school to visited list
                });
            }
        });

        // stop bouncing button
        $('#' + SE.C.STOP_BOUNCE).live('click', function () {
            $.each(SE.G.mlist, function (sID, marker) {
                 marker.setAnimation(null);
            });
            $(this).hide();
        });
        
        $('#' + SE.C.CLOSE_ALL_INFO_WINDOW).live('click', function () {
            $.each(SE.G.iwlist, function (sID, infowindow) {
                 infowindow.close();
            });
            // and also stop the bouncing ...
            $.each(SE.G.mlist, function (sID, marker) {
                 marker.setAnimation(null);
            });
            $(this).hide();
            SE.hideSchoolContext();
        });
    },

    getSchoolSearchValues : function () {
        SE.I.SCHOOL_ADDRESS = $('#' + SE.C.ADDRESS_FIELD_ID).val();
        SE.I.SCHOOL_DISTANCE = $('#' + SE.C.DISTANCE_FIELD_ID).val();
        SE.I.SCHOOL_AGE = $('#' + SE.C.AGE_FIELD_ID).val();
        SE.I.SCHOOL_RELIGION = $('#' + SE.C.RELIGION_FIELD_ID).val();
        SE.I.SCHOOL_GENDER = $('#' + SE.C.GENDER_FIELD_ID).val();
    },

    setSchoolSearchValues : function (urlParams) {
        $('#' + SE.C.ADDRESS_FIELD_ID).val(urlParams.address);
        $('#' + SE.C.DISTANCE_FIELD_ID).val(urlParams.distance);
        $('#' + SE.C.AGE_FIELD_ID).val(urlParams.age);
        $('#' + SE.C.RELIGION_FIELD_ID).val(urlParams.religion);
        $('#' + SE.C.GENDER_FIELD_ID).val(urlParams.gender);
    },


    showSchools : function () {
        SE.getSchoolSearchValues();

        $('#' + SE.C.DETAILS_ELEMENT_ID).empty();

        SE.position2Address(SE.I.SCHOOL_ADDRESS, function (lat, lng) { // get the location from address and show the 'nearby' schools
            SE.initMap(lat, lng);
            var timeoutID = window.setTimeout(SE.showSchoolsNearLocation, 500, lat, lng, SE.I.SCHOOL_DISTANCE, SE.I.SCHOOL_RELIGION, SE.I.SCHOOL_GENDER);
        });
    },

    showSchoolsNearLocation : function (lat, lng, distance, religion, gender) {
        $.getJSON(SE.buildNearSchoolsURI(lat, lng, distance, religion, gender), function (data, textStatus) {
            if (data.data) {
                SE.compileSchoolInfo(lat, lng, data.data);
            }
        });
    },

    compileSchoolInfo : function (lat, lng, rows) {
        var schoolURIs = [];
        var inRangeSchools = [];

        $.each(rows, function (i, s) {
            var school_state = SE.determineSchoolRangeState(s["label"].value, s["distance"].value, s["religion"].value, s["gender"].value);

            if (school_state == 'inrange') {
                inRangeSchools.push(s['school'].value);
                schoolURIs.push(encodeURIComponent(s['school'].value));
            }
        });

        if (inRangeSchools.length > 0) {
            schoolURIs = schoolURIs.join('+');

            $('#' + SE.C.DETAILS_ELEMENT_ID).append('<div id="'+SE.C.AGEGROUPS_ELEMENT_ID+'"/>');
            SE.renderChart.ageGroups(schoolURIs, $('#'+SE.C.AGEGROUPS_ELEMENT_ID));
        }

        $('#' + SE.C.DETAILS_ELEMENT_ID).append('<ul id="'+SE.C.SCHOOL_ENROLMENT_ELEMENT_ID+'"/>');

        var counter = 0;

        for(i in rows) {
            var row = rows[i];

            var school_state = SE.determineSchoolRangeState(row["label"].value, row["distance"].value, row["religion"].value, row["gender"].value);

            var school_marker = (school_state == 'inrange') ? ++counter : 0;
            var schoolSymbol = SE.drawMarker(school_marker, school_state, row["label"].value, row["distance"].value, row["religion"].value, row["gender"].value);
            SE.addSchoolMarker(row, schoolSymbol);

            if ($.inArray(row['school'].value, inRangeSchools) > -1) {
                SE.renderSchool(row, schoolSymbol);
            }
        }
    },

    renderChart : {
        ageGroups : function (schoolURIs, htmlNodeContainer) {
            var uri = SE.C.AGEGROUPS_API_BASE + schoolURIs;

            $.getJSON(uri, function (data, textStatus) {
                var agegroups = '';
                var xdata = [];
                var ydata = [];

                if (data != null && data.data[0].length != 0) {
                    totalCalculated = 0;
                    $.each(data.data, function (i, agegroup) {
                        xdata.push(agegroup.age_label.value);
                        ydata.push(parseInt(agegroup.population.value));
                        totalCalculated = totalCalculated + parseInt(agegroup.population.value);
                    });

                    SE.G.chartAPI = new jGCharts.Api();
                    agegroups += '<img src="' + SE.G.chartAPI.make({
                        data : ydata,
                        title       : 'Demographics',
                        title_color : '111111',
                        title_size  : 12,
                        legend :  ['Population'],
                        axis_labels : xdata,
                        size : '360x150',
                        type : 'bvg',
                        colors : ['003399'],
                        bar_width : 5,
                        axis_range : '1,0,300',
                        scaling : '0,300'
                    }) + '"/>';
                    agegroups += '<div class="chart_more">Total: ' + totalCalculated + '</div>';
                    agegroups += '<div class="chart_more">Year: 2006 | Source: <a href="http://cso.ie/" target="_blank">CSO</a>, Census</div>';
                }
                else {
                   agegroups += '<p class="no_stats">No demographics available for this area, sorry ...</p>';
                }

                htmlNodeContainer.append(agegroups);
            });
        },

        enrolment : function (school, htmlNodeContainer) {
            var uri = SE.C.ENROLMENT_API_BASE + encodeURIComponent(school["school"].value);

            var total = 0;
            var totalCalculated = 0;
            var totalGirls = 0;
            var totalBoys = 0;

            htmlNodeContainer.append('<div class="enrolment processing"/>');

            $.getJSON(uri, function (data, textStatus) {
                enrolment = '';
                var xdata = [];
                var ydata = [];

                school_years = SE.C.SCHOOL_YEARS;

                $.each(data.data, function (i, grade) {
                    if (school_years[grade.numberOfStudentsURI.value]) {
                        school_years[grade.numberOfStudentsURI.value].value = parseInt(grade.numberOfStudents.value);
                        totalCalculated = totalCalculated + school_years[grade.numberOfStudentsURI.value].value;
                    }
                    else {
                        switch(grade.numberOfStudentsURI.value) {
                            case "http://data-gov.ie/number-of-students":
                                total = parseInt(grade.numberOfStudents.value);
                                break;
                            case "http://data-gov.ie/number-of-girl-students":
                                totalGirls = parseInt(grade.numberOfStudents.value);
                                break;
                            case "http://data-gov.ie/number-of-boy-students":
                                totalBoys = parseInt(grade.numberOfStudents.value);
                                break;
                            case "http://data-gov.ie/number-of-students-excluding-TY":
                                totalExcludingTY = parseInt(grade.numberOfStudents.value);
                            default:
                                break;
                        }
                    }
                });

                $.each(school_years, function (index, o) {
                    xdata.push(o.label);
                    ydata.push(o.value);
                });

                SE.G.chartAPI = new jGCharts.Api();
                enrolment += '<img src="' + SE.G.chartAPI.make({
                    data : ydata,
                    title : 'Enrolment',
                    title_color : '111111',
                    title_size : 12,
                    legend : ['Population'],
                    axis_labels : xdata,
                    size : '360x150',
                    type : 'bvg', 
                    colors : ['009933'],
                    bar_width : 5,
                    axis_range : '1,0,300',
                    scaling : '0,300'
                }) + '"/>';

                enrolment += '<div class="chart_more">Total: ' +  total + ' (' + totalCalculated +') | Girls: '  +  totalGirls + ' | Boys: ' +  totalBoys + '</div>';
                //  TODO: check if the year is correct
                enrolment += '<div class="chart_more">Year: 2010 | Source: <a href="http://www.education.ie/" target="_blank">Dept. of Education</a></div>';

                htmlNodeContainer.find('.enrolment').append(enrolment);
                htmlNodeContainer.find('.enrolment').removeClass('processing');
            });
        }
    },


    addSchoolMarker : function (school, schoolSymbol) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(school["lat"].value, school["long"].value),
            map: SE.G.smap,
            icon: new google.maps.MarkerImage(schoolSymbol, new google.maps.Size(SE.C.GM_MARKER_SIZE.width, SE.C.GM_MARKER_SIZE.height)),
            title: school["label"].value
        });

//        SE.G.mlist[school["school"].value] = marker; // remember marker indexed by school ID

        var school_state = SE.determineSchoolRangeState(school["label"].value, school["distance"].value, school["religion"].value, school["gender"].value);

        if (school_state == 'inrange') {
            google.maps.event.addListener(marker, "click", function () {
                $.scrollTo('#school_' + SE.getSchoolNotation(school['school'].value), {duration : 500});
            });
        }
        else {
            google.maps.event.addListener(marker, "click", function () {
                window.open(SE.replaceURIsHost(school["school"].value, window.location.host), '_blank');
            });
        }
    },

    renderSchool : function (school, schoolSymbol) {
        school_info = '<li id="school_' + SE.getSchoolNotation(school['school'].value) + '" class="school_info">';

        school_info += '<h2><img src="' + schoolSymbol +'"/> ' + '<a href="' + SE.replaceURIsHost(school["school"].value, window.location.host) + '" target="_blank">' + school["label"].value + '</a></h2>';
        school_info += '<div class="summary">';
        if (school["address1"]) { school_info += '<span class="head">Address:</span> ' + school["address1"].value; }
        if (school["address2"]) { school_info += ' ' + school["address2"].value; }
        if (school["region_label"]) { school_info += ', ' + school["region_label"].value; }

        school_info += " | ";

        if (school["phaseOfEducation_label"]) { school_info += '<span class="head">Education:</span> ' + school["phaseOfEducation_label"].value + ' school | '; }
        if (school["religion_label"]) { school_info += '<span class="head">Religion:</span> ' + school["religion_label"].value.toLowerCase() + ' | '; }
        if (school["gender_label"]) { school_info += '<span class="head">Gender:</span> ' + school["gender_label"].value.toLowerCase(); }
        school_info += '</li>';

        $('#' + SE.C.SCHOOL_ENROLMENT_ELEMENT_ID).append(school_info);

        SE.renderChart.enrolment(school, $('#school_' + SE.getSchoolNotation(school['school'].value)));
    },

    determineSchoolRangeState : function (label, distance, religion, gender) {
        /*States: inapplicable, inrange, outofrange*/
        school_state = 'inrange';

        if (parseFloat(distance) > parseFloat(SE.I.SCHOOL_DISTANCE)) {
            school_state = 'outofrange';
        }

        //TODO: Age

        if (SE.I.SCHOOL_RELIGION != '' && religion != SE.I.SCHOOL_RELIGION) {
            school_state = 'inapplicable';
        }

        if (gender != SE.I.SCHOOL_GENDER) {
            school_state = 'inapplicable';
        }

       return school_state;
    },

    drawMarker : function (school_marker, school_state, name, distance, religion, gender) {
        // see also http://www.html5canvastutorials.com/
        var canvas = document.getElementById(SE.C.MARKER_DYNAM_ID); // our scribble board
        var context = canvas.getContext('2d');

        // create the pin
        context.beginPath();
        context.strokeStyle = '#333';
        context.fillStyle = '#333';
        context.moveTo(8, 17);
        context.lineTo(8, 24);
        context.fill();
        context.lineWidth = 2;
        context.stroke();

        x = 0;
        y = 0;
        width = 16;
        height = 16;
        x_text = 5;
        y_text = 12;

        SE.C.GM_MARKER_SIZE.width = 16;

        if (school_marker > 9) {
            SE.C.GM_MARKER_SIZE.width = 18;
            x_text = 3;
        }

        if (school_marker > 99) {
            x = 0;
            SE.C.GM_MARKER_SIZE.width = 24;
            x_text = 3;
        }

        context.beginPath();
        context.rect(x, y, SE.C.GM_MARKER_SIZE.width, height);
        switch(school_state) {
            case 'inapplicable': default:
                context.strokeStyle = '#000';
                context.fillStyle = '#000';
                break;
            case 'inrange':
                context.strokeStyle = '#647819';
                context.fillStyle = '#647819';
                break;
            case 'outofrange':
                context.strokeStyle = '#777';
                context.fillStyle = '#777';
                break;
        }
        context.fill();
        context.stroke();

        if (school_marker > 0) {
            context.fillStyle = '#fff';
            context.font = "8pt monospace";
            context.fillText(school_marker, x_text, y_text);
        }

        //FIXME: Why bother using a data URI? This doesn't get cached!
        //TODO: Best is to skip image based markers and use simple text based (if possible) since we are only displaying numbers with a background colour.
        return canvas.toDataURL("image/png");
    },


    getSchoolInfo : function (schoolId) {

    },

    showSchoolContext : function () {
        var schoolURI = SE.G.currentSchoolID = SE.C.SCHOOL_DATA_NS_URI + SE.getSchoolNotation(window.location.href);
        var uri = SE.C.INFO_API_BASE + encodeURIComponent(schoolURI);

        $('#' + SE.C.DETAILS_ELEMENT_ID).empty();

        $.getJSON(uri, function (data, textStatus) {
            if (data.data) {
                school = data.data[0];

                if (!school["distance"]) {
                    $.extend(school, {"distance" : {"value" : 0}});
                }

                //XXX: I do this here like this temporarily because I have to refactor stuff later.
                SE.I.SCHOOL_DISTANCE = 0
                SE.I.SCHOOL_RELIGION = school['religion'].value;
                SE.I.SCHOOL_GENDER = school['gender'].value;

                SE.compileSchoolInfo(school["lat"].value, school["long"].value, [school]);

                schoolLocation = new google.maps.LatLng(school["lat"].value, school["long"].value);

                SE.renderSchoolOnSV(SE.C.SV_MAP_ELEMENT_ID, schoolLocation);
                SE.nearbyBusy();
                $('#' + SE.C.SCHOOL_CONTEXT_ELEMENT_ID).show();
                $('#' + SE.C.NEARBY_RADIUS_ELEMENT_ID).show();
                $('#' + SE.C.NEARBY_SLIDER_ELEMENT_ID).show();
                // now trigger LGD look-up and make the school listing fit:
                SE.renderSchoolNearby(SE.C.NEARBY_ELEMENT_ID, school["lat"].value, school["long"].value, SE.G.contextRadius);
            }
        });
    },

    hideSchoolContext : function () {
        $('#' +  SE.C.SCHOOL_CONTEXT_ELEMENT_ID).slideUp();
        $('#' +  SE.C.DETAILS_ELEMENT_ID).css("width", "100%");
    },

    nearbyBusy : function () {
        $('#' + SE.C.NEARBY_ELEMENT_ID).html("<div id='nearby_busy'><img src='../img/busy.gif' alt='busy'/><div>Retrieving data from <a href='http://linkedgeodata.org/About' target='_blank'>LinkedGeoData</a> ...</div></div>");
    },

    // for example: near?center=53.289,-9.0820&distance=5000&religion=Catholic&gender=Gender_Boys
    buildNearSchoolsURI : function (lat, lng, distance, religion, gender) {
        var r = "";
        var boundary = "";

        if (SE.G.useMapBounds) {
            SE.G.mapBounds = SE.G.smap.getBounds();

            var south = SE.G.mapBounds.Y['b'];
            var west = SE.G.mapBounds.$['b'];
            var north = SE.G.mapBounds.Y['d'];
            var east = SE.G.mapBounds.$['d'];

            boundary = '&south=' + south + '&west=' + west + '&north=' + north + '&east=' + east;
        }

        var url = SE.C.NEAR_API_BASE + lat + "," + lng + "&distance=" + parseInt(distance) + boundary;
console.log(url);
        return url;
    },

    // for example: lgd_lookup?center=53.274795076024,-9.0540373672574&radius=1000
    buildNearPOIURI : function (lat, lng, radius) {
        return SE.C.NEARBY_API_BASE + lat + "," + lng + "&radius=" + radius;
    },

    position2Address : function (address, callback) {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address': address, 'region': 'ie'}, function (data, status) {
            if (status == google.maps.GeocoderStatus.OK) {  
                var location = data[0].geometry.location,
                    lat = location.lat(),
                    lng = location.lng();
                if (location) { // we have both values
                    callback(lat, lng);
                }
            }
            else {
                alert("Sorry, I didn't find the address you've provided. Try again, please ...");
            }
        });
    },

    initMap : function (mapCenterLat, mapCenterLng) {
        mapCenterCoords = new google.maps.LatLng(mapCenterLat, mapCenterLng);
        SE.I.MAPCENTER_LAT = mapCenterLat;
        SE.I.MAPCENTER_LONG = mapCenterLng;

        var mapOptions = { 
            zoom: SE.G.selectedZoomFactor,
            center: mapCenterCoords,
            mapTypeId: SE.C.MAP_TYPE,
            overviewMapControl: true,
            overviewMapControlOptions: {
                position: google.maps.ControlPosition.BOTTOM_RIGHT,
                opened: true
            }
        };
        // create the map with options from above
        SE.G.smap = new google.maps.Map(document.getElementById(SE.C.MAP_ELEMENT_ID), mapOptions);

        google.maps.event.addListener(SE.G.smap, 'dragend', function() {
            SE.getBoundsReloadMap();
        });

        google.maps.event.addListener(SE.G.smap, 'zoom_changed', function() {
            SE.getBoundsReloadMap();
        });

        google.maps.event.addListener(SE.G.smap, 'dblclick', function() {
            SE.getBoundsReloadMap();
        });

        if ($('body#school').length != 1) {
            homeMarker = new google.maps.Marker({
                position: mapCenterCoords,
                map: SE.G.smap,
                icon: new google.maps.MarkerImage('/theme/base/images/icons/icon_home.png'),
                title: $('#' + SE.C.ADDRESS_FIELD_ID).val()
            });

            var circle = {
                center: mapCenterCoords,
                radius: parseInt(SE.I.SCHOOL_DISTANCE),
                map: SE.G.smap,
                editable: true,
                draggable: true,
                strokeColor: "#000000",
                strokeWeight: 2,
                fillColor: "#000000",
                fillOpacity: 0.1
            }

            rangeControl = new google.maps.Circle(circle);

            google.maps.event.addListener(rangeControl, "radius_changed", function () {
                $('#' + SE.C.DETAILS_ELEMENT_ID).empty();
                SE.I.SCHOOL_DISTANCE = radius = rangeControl.getRadius();
                SE.showSchoolsNearLocation(SE.I.MAPCENTER_LAT, SE.I.MAPCENTER_LONG, parseInt(SE.I.SCHOOL_DISTANCE), SE.I.SCHOOL_RELIGION, SE.I.SCHOOL_GENDER);
            });

            google.maps.event.addListener(rangeControl, "center_changed", function () {
                $('#' + SE.C.DETAILS_ELEMENT_ID).empty();
                SE.I.MAPCENTER_LAT = rangeControl.center['Pa'];
                SE.I.MAPCENTER_LONG = rangeControl.center['Qa'];
                SE.showSchoolsNearLocation(SE.I.MAPCENTER_LAT, SE.I.MAPCENTER_LONG, parseInt(SE.I.SCHOOL_DISTANCE), SE.I.SCHOOL_RELIGION, SE.I.SCHOOL_GENDER);
            });
        }

        // make map fit in the container and set in focus
        $('#' + SE.C.MAP_ELEMENT_ID).width($('#' + SE.C.CONTAINER_ELEMENT_ID).width() * SE.G.smapWidth);
        $.scrollTo('#' + SE.C.RESULT_ELEMENT_ID, {duration : 1000});
    },

    getBoundsReloadMap : function () {
        SE.G.mapBounds = SE.G.smap.getBounds();
        $('#' + SE.C.DETAILS_ELEMENT_ID).empty();
        SE.showSchoolsNearLocation(SE.I.MAPCENTER_LAT, SE.I.MAPCENTER_LONG, parseInt(SE.I.SCHOOL_DISTANCE), SE.I.SCHOOL_RELIGION, SE.I.SCHOOL_GENDER);
    },

    renderSchoolOnSV : function (elemID, centerLoc) {
        // TODO: if no SV is available, show something else (?)
        var schoolpano = new google.maps.StreetViewPanorama(document.getElementById(elemID), {
            position : centerLoc,
            pov: {
                heading : 100,
                pitch : 0,
                zoom : 1
            },
            panControl : false,
            addressControl: false,
            scrollwheel : false,
            zoomControl : false
        });
        schoolpano.setVisible(true);
        $('#' + elemID).slideDown('slow');
    },

    renderSchoolNearby : function (elemID, lat, lng) {
        // now, get the schools nearby things via LinkedGeoData
        $.getJSON(SE.buildNearPOIURI(lat, lng, SE.G.contextRadius), function (data, textStatus) {
            if (data.data) {
                var buf = [""];
                var rows = data.data;

                buf.push("<div class='nearby_pois'>");
                if (rows.length > 0) {
                    buf.push("<ul>");
                    for(i in rows) {
                        var row = rows[i];
                        var poiType = "";

                        buf.push("<li><a href='" + row["poi"].value +"' target='_blank'>" + row["poi_label"].value + "</a>");
                        if (row["poi_type"]) {
                            poiType = row["poi_type"].value;
                            buf.push(" a <a href='" + poiType +"' target='_blank'>" + poiType.substring(poiType.lastIndexOf("/") + 1).toLowerCase() + "</a>");
                        }
                        if (row["sameas"].value) {
                            buf.push(", see also <a href='" + row["sameas"].value +"' target='_blank'>DBpedia</a>");
                        }
                        buf.push("</li>");
                    }
                    buf.push("</ul></div>");
                }
                else{
                    buf.push("<p>Sorry, didn't find anything nearby ...</p></div>");
                }
                $('#' + elemID).html(buf.join(""));
                $('#' + elemID).slideDown('slow');
            }
            else {
                buf.push("<div class='nearby_pois'><p>Sorry, didn't find anything nearby ...</p></div>");
                $('#' + elemID).html(buf.join(""));
                $('#' + elemID).slideDown('slow');
            }
        });
    },


    getSchoolNotation : function (uri) {
        return uri.substring(uri.lastIndexOf("/school/") + 8);
    },


    determineRenderMode : function () {
        var currentURL = document.URL;
        var hashPos = currentURL.indexOf("#");
        var schoolID = "";

        if (hashPos >= 0 && currentURL.substring(hashPos + 1) != "") { // trigger single school rendering for a hash URI such as http://school-explorer.data-gov.ie/school#63000E
            SE.G.currentMode = SE.C.SCHOOL_DETAIL_MODE;
            schoolID = currentURL.substring(hashPos + 1); // extract the school identifier, resulting in 63000E
            SE.G.currentSchoolID = SE.C.SCHOOL_DATA_NS_URI + schoolID;  // assemble school URI, resulting in  http://data-gov.ie/school/63000E
        }
        else{ // trigger school listing
            SE.G.currentMode = SE.C.SCHOOL_LISTING_MODE;
//            window.location = SE.C.BASE_URI + "#";
            SE.renderSchoolOverview(); // show some overview stats and examples
        }
    },

    addSchoolInfo : function (schoolID, marker, iwcontent) {
        var infowindow = null;
        
        if (schoolID in SE.G.iwlist) { // the info window has already be created just updated content
            infowindow = SE.G.iwlist[schoolID];
        }
        else {
            infowindow = new google.maps.InfoWindow();
        }
        infowindow.setContent(iwcontent);
        infowindow.open(SE.G.smap, marker);
        $('#' + SE.C.CLOSE_ALL_INFO_WINDOW).show();
        return infowindow;
    },

    getGenderCoding : function (gender) {
        if (gender.indexOf('Boys') > 0) return SE.G.genderCCodes['boys'];
        if (gender.indexOf('Girls') > 0) return SE.G.genderCCodes['girls'];
        return SE.G.genderCCodes['mixed'];
    },

    getReligionCoding : function (religion) {
        if (religion.indexOf('catholic') > 0) return SE.G.religionCCodes['catholic']; // catholic is yellow
        return SE.G.religionCCodes['others']; // all others are white
    }
};

$(document).ready(function () {
    SE.init(); // start interaction

    bodyId = $('body').attr('id');

    switch (bodyId) {
        case 'home':
            SE.renderSchoolOverview();
            break;

        case 'map':
                // TESTS:
                // SE.initSVMap("school_details", new google.maps.LatLng(53.289,-9.082));
                // $('#' + SE.C.DETAILS_ELEMENT_ID).html("<div style='background: #303030; padding: 1em;'><img src='" + SE.drawMarker("test school", "http://data-gov.ie/ReligiousCharacter/Catholic", "http://education.data.gov.uk/ontology/school#Gender_Boys") + "' alt='test'/></div>");
                // $('#' + SE.C.DETAILS_ELEMENT_ID).html(SE.renderSchoolEnrolment("http://data-gov.ie/school/62210K"));
            break;

        case 'school':
            SE.initNearbyPanel();
            break;
    }
});
