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
	info?school_name=name
	
Output:

Information about the school

Example:

	http://school-explorer/info?school_name=Loreto Secondary School


## License

This software is Public Domain.
