# School Explorer

## What is the app about?

Presents information about schools to help parents to decide where to send their kids to. It uses Open Data from the CSO and DE in Ireland.

## Application Setup

TODO: describe

## API documentation

### Near
Get all schools near a certain location (lat/lng):

Input:

	near?center=lat,long&religion=religiousCharacter&gender=genderType (religion and gender are optional)
	
Output:

Information about the top 50 schools near these co-ordinates, ordered by distance descending (nearest first)

Example:

	http://school-explorer/near?center=53.772431654289,-7.1632585894304&religion=Catholic&gender=Gender_Boys

### Info
Get information about a school:

Input:
	info?school_id=schoolURI&school_name=name (expecting schoolURI to be urlencoded; either school_id or school_name is used, if both provided, school_id is used)
	
Output:

Information about the school

Example:

	http://school-explorer/info?school_id=school_id=http%3A%2F%2Fdata-gov.ie%2Fschool%2F62210K&school_name=Loreto Secondary School

### Enrolment
Get enrolment data for schools

Input

    enrolment?school_id=schoolURI (expecting schoolURI to be urlencoded)

Output:

Enrolment information for school URI provided

Example:

    http://school-explorer/enrolment?school_id=http%3A%2F%2Fdata-gov.ie%2Fschool%2F62210K


### Age groups
Get upcoming age groups in school's area

Input
    agegroups?school_id=schoolURI (expecting schoolURI to be urlencoded)

Output
Population for given area broken down for ages 0 to 5.

Example
    http://school-explorer/agegroups?school_id=http%3A%2F%2Fdata-gov.ie%2Fschool%2F63000E


## License

This software is Public Domain.


## TODO

### API
Determine remaining API components and implement them:
 
#### LinkedGeoData API

Using the [LGD API](http://linkedgeodata.org/OnlineAccess/RestApi?v=klu "linkedgeodata.org : Online&nbsp;Access&nbsp;/&nbsp;Rest&nbsp;Api") such as:

	http://linkedgeodata.org/data/near/53.7724,-7.1632/1000
	
pass through:

INPUT: lgd_lookup?center=lat,long&radius=r (r is in meters, if no radius, defaults to 1000)

OUTPUT:

	data: [
		{
			poi: {
				type: "uri"
				value: http://linkedgeodata.org/triplify/node268767536
			}
			poi_label: {
				type: "typed-literal"
				value: "National University of Ireland, Galway"
			}
			poi_type: {
				type: "uri"
				value: http://linkedgeodata.org/ontology/University
			}
			sameas: {
				type: "uri"
				value: http://dbpedia.org/resource/National_University_of_Ireland,_Galway
			}
		}
		
EXAMPLE: lgd_lookup?center=53.274795076024,-9.0540373672574&radius=1000

#### Enrolment API 

provide `schoolGrade_label` in enrolment?school_id and sort it by grade

### Data
Finalize dataset for school.

### Server
Setup to include Apache, Fuseki, Lucene (LARQ)
