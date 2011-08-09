# School Explorer application

## Overview

The School Explorer has the following screens:

- homepage
- map page
- school detail page
- area detail page

Of these, the map page is the most important one. It is divided into multiple interacting panels, described in detail below.

## Homepage

The homepage contains some general information about the purpose of the application, and an enlarged version of the search panel.

After the user makes their choices in the search panel and clicks the search button, they are taken to the map page.

## School detail page

The school detail page shows detailed information for a single school.

## Area detail page

The area detail page shows detailed information for an area.

The area described is actually a group of one or more atomic areas, so the presented information is an aggregate of the atomic areas.

An atomic area is either an Enumeration Area (in urban areas) or an Electoral District (in rural areas).

## Map page

The map page contains the following panels:

- title panel
- search panel
- map panel
- legend panel
- result panel

## Title panel

The title panel contains the text “School Explorer” and links to any auxilliary pages like “About”, “Contact”, “Help” or whatever else we might need. It is present on all pages, not just on the map page.

## Map panel

An interactive map. The user can pan and zoom using the normal map controls. The map shows the following entities, schools and atomic areas. Furthermore, the map has an interactive “range control” that is used to select a circular area around a midpoint.

### Schools

These are symbolized by a colored icon located at the school's geographic position.

Clicking on the icon shows the school detail page.

A school is always in one of three states:

- inapplicable
- in range
- out of range

An “inapplicable” school is one that is not matched by the search options selected in the search panel. Inapplicable schools should be shown in a color that indicates a “deactivated” state. Inapplicable schools can still be clicked to see their details, but will never show up in the result panel.

Schools that are matched by the general search criteria are “in range” if selected by the range control, and “out of range” if not selected by the range control.

Schools that are out of range are shown in color, but without a number marker. They do not show up in the result panel.

Schools that are in range are shown in color, and *with* a number marker. The number marker assigns a number (1, 2, 3, etc) to all in-range schools. (Perhaps starting with 1 for the school closest to the midpoint of the range control.) Schools are numbered in the result panel with the same number.

Colors of school markers reflect their type: primary/post-primary, girl/boy/mixed, denomination. (Details TBD.)

### Atomic areas

These are symbolized by a small icon located at the midpoint of the area, e.g., a small disk. Casual users don't really need to know about the atomic areas, and don't need to interact with them, so they don't need to be very visible.

Clicking on the icon shows the area detail page for that atomic area.

An atomic area is always in one of two states, “in range” or “out of range”. The difference is visualized by different color for the icon. The “out of range” color should probably be gray. The “in range” color should be reflected in the color choice for the “Area” subsection of the result panel. The state of an atomic area has no effect on interactivity. The state is manipulated by moving the range control.

### Range control

The range control is an interactive widget that can be used to select a circular area on the map, and at the same time it visualizes the extent of the selected area.

It can be manipulated via two “pins” that can be moved by dragging and dropping them. One pin is at the center of the area, the second one is on the edge of the circle around the area. Moving the center pin moves the entire circular area without changing its size. Moving the edge pin changes the size of the circle without changing its center location.

At any time, a circle is drawn on the map, with the center pin in the center of the circle, and the edge pin on the circle itself. Ideally, this circle would be updated in realtime whenever one of the pins is dragged.

Ideally, a small label next to the edge pin would indicate the radius of the circle: for example, “2.4km”.

Manipulating the range control changes the status of schools and atomic areas. Any schools and atomic areas outside of the circle are considered “out of range”. Changing the area will thus require updating the markers for these entities, and will require updating the result panel.

## Legend panel

This is a non-interactive panel that displays colored school markers and indicates what type of school they represent.

## Search panel

Features the following widgets and choices. This needs work.

- Pupil's age: (dropdown of all eligible ages)
- OR grade/year: (dropdown of school years/grades)
- (dropdown, 3 values) [boy/girl]/[boy]/[girl]
- (dropdown) Denomination: [any]/[…]/[…]
- Home address/town: [textfield]
- Show schools within (dropdown) km

Making a change, or clicking the “Find schools” button, will:

- update which schools are applicable/inapplicable
- recenter the map if necessary
- recenter the range control if necessary
- resize the range control if necessary
- update the “in range”/“out of range” status of eligible schools and atomic areas

## Result panel

The result panel shows at the top an “Area” section, and below that zero or more “School” sections. The area section represents an aggregate of all in-range atomic areas. Each “school” section represents one applicable in-range school, in order of their number markers.

### Area section

The area section shows basic aggregate statistics for the total area that comprises the in-range atomic areas, and a population chart. Along these lines:

**Population** 4-18: **672** (47%♀, 53%♂)

And perhaps also (if we have this data available): 87km²

(Showing the total area would help to clarify that changing the range control doesn't actually fluidly select people living exactly in that area, but only has an indirect effect on the area section by selecting or deselecting atomic areas.)

### School section

The school section shows:

- the marker (with exact shape, color and number) used for that school on the map
- name of the school
- a population chart
- total number of pupils
- type of school (e.g., primary school, catholic, mixed or something like that)

### Population charts

These are bar charts with 19 bars, for ages 0-18. They always have the same width and the same height. It is important that they are vertically aligned  so that the bars for the same age match up.

The population chart for an area shows simply the number of people. It is scaled so that the maximum number fits into the chart.

The population chart for a school shows the enrolment number for pupils of that age. We assume:

    age 0-3 -- not yet in school
    age 4-11 -- primary
    age 12-18 -- post-primary

See:
http://en.wikipedia.org/wiki/Education_in_the_Republic_of_Ireland

The bars probably should be labelled:

    [0 1 2 3] [J S 1 2 3 4 5 6] [1 2 3 T 1 2 3]

where each of the bracketed group should use a slightly different color (labels and bars) in order to make it easier to decipher the chart.

The bar that represents the chosen age of the pupil from the search box (if any) should be highlighted in a very noticable color.
