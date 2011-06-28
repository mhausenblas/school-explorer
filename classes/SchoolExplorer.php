<?php
/*
 * @category  Base class
 * @package   
 * @author    Sarven Capadisli <sarven.capadisli@deri.org>
 * @copyright Public Domain
 * @license   
 * @link      http://deri.ie/
 */

require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . '../lib/easyrdf/lib/EasyRdf.php';

class SchoolExplorer
{
    var $config;

    function __construct()
    {
        define('STORE_URI', 'http://data-gov.ie/sparql');

        $this->config = array();
        $this->setPrefixes();
        $this->setObjectMapping();
        $this->setAPIElements();
        $this->getHTTPRequest();

        switch($this->config['requestPath'][0]) {
            case 'about':
                require_once 'templates/page.about.html';
                break;

            case 'school':
                require_once 'templates/page.school.html';
                break;

            case 'map':
                require_once 'templates/page.map.html';
                break;

            case 'near': case 'info': case 'enrolment': case 'agegroups':
                $this->sendAPIResponse();
                break;

            case 'lgd_lookup':
                $this->sendRemoteAPIResponse();
                break;

            default: //home
                require_once 'templates/page.home.html';
                break;
        }

    }

    function home()
    {
        echo "\n".'<p>home sweet home</p>';


    }


    function school()
    {
        $paths = $this->config['requestPath'];

        if (isset($paths[1]) && !empty($paths[1])) {
            $query = <<<EOD
SELECT ?school ?property ?object
WHERE {
    <http://data-gov.ie/school/$paths[1]> ?property ?object .
}
EOD;
        }
        else {
            $query = <<<EOD
SELECT ?school ?establishmentName
WHERE {
    ?school a sch-ont:School .
    ?school sch-ont:establishmentName ?establishmentName .
}
ORDER BY ASC(?establishmentName)
EOD;
        }

        $uri = $this->buildQueryURI($query);

        $response = $this->curlRequest($uri);

        $response = json_decode($response, true);

        if (isset($paths[1]) && !empty($paths[1])) {
            $response = $this->showSchool($response);
        }
        else {
            $response = $this->showList($response, 'Schools');
        }

        return $response;
    }


    function showList($data, $title=null, $id=null, $class=null)
    {
        if ($id != null) {
            $id = ' id =".$id."';
        }
        if ($class != null) {
            $class = " $class";
        }

        $vars = $data['head']['vars'];

        $bindings = $data['results']['bindings'];

        $s = <<<EOD
        <dl$id class="aside$class">
            <dt>$title</dt>
            <dd>
                <ul>
EOD;
        foreach($bindings as $key => $value) {
            foreach($vars as $k => $var) {
                $textContent = '';
                if ($value[$var]['type'] == 'uri') {
                    //TODO: @href would probably be mapped from something
                    $href = $value[$var]['value'];
                }
                else {
                    $textContent = ($value[$var]['value'] != '<Null>') ? $value[$var]['value'] : '';
                    $textContent = $this->htmlEscape($textContent);
                }
            }

            $s .= "\n".'<li><a href="'.$href.'">'.$textContent.'</a></li>';
        }
        $s .= <<<EOD

                </ul>
            </dd>
        </dl>
EOD;
        return $s;
    }


    function showSchool($data)
    {
        $vars = $data['head']['vars'];

        $bindings = $data['results']['bindings'];

        $s = <<<EOD
        <dl>
EOD;
        foreach($bindings as $key => $value) {
            foreach($value as $k => $v) {
                if ($k == 'property') {
                    $property = $this->getPrefixName($value['property']['value']);
                }
                else {
                    $object = $value['object']['value'];
                }

            }
            $s .= <<<EOD
                <dt>$property</dt>
                <dd>$object</dd>
EOD;

        }
        $s .= '</dl>';

        return $s;
    }


    function getPrefixName($uri)
    {
        $prefixName = array_search(strstr($uri, '#', true).'#', $this->config['prefixes']);
        if ($prefixName) {
            return $prefixName;
        }
        else {
            return $uri;
        }
    }

    function curlRequest($uri)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $uri);
        curl_setopt($ch, CURLOPT_USERAGENT, "https://github.com/mhausenblas/school-explorer");
//        curl_setopt($ch, CURLOPT_HEADER, 1);
//        curl_setopt($ch, CURLOPT_HTTPHEADER, array("Accept: application/json"));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $output = curl_exec($ch);
        curl_close($ch);

        return $output;
    }


    function getPrefix($prefix = null)
    {
        if (is_null($prefix)) {
            return $this->config['prefixes'];
        }
        else {
            return $this->config['prefixes'][$prefix];
        }
    }


    function setPrefixes()
    {
        $this->config['prefixes'] = array(
            'rdf'               => 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            'rdfs'              => 'http://www.w3.org/2000/01/rdf-schema#',
            'owl'               => 'http://www.w3.org/2002/07/owl#',
            'xsd'               => 'http://www.w3.org/2001/XMLSchema#',
            'dcterms'           => 'http://purl.org/dc/terms/',
            'foaf'              => 'http://xmlns.com/foaf/0.1/',
            'skos'              => 'http://www.w3.org/2004/02/skos/core#',
            'wgs'               => 'http://www.w3.org/2003/01/geo/wgs84_pos#',
            'dcat'              => 'http://www.w3.org/ns/dcat#',

            'sdmx'              => 'http://purl.org/linked-data/sdmx#',
            'sdmx-attribute'    => 'http://purl.org/linked-data/sdmx/2009/attribute#',
            'sdmx-code'         => 'http://purl.org/linked-data/sdmx/2009/code#',
            'sdmx-concept'      => 'http://purl.org/linked-data/sdmx/2009/concept#',
            'sdmx-dimension'    => 'http://purl.org/linked-data/sdmx/2009/dimension#',
            'sdmx-measure'      => 'http://purl.org/linked-data/sdmx/2009/measure#',
            'sdmx-metadata'     => 'http://purl.org/linked-data/sdmx/2009/metadata#',
            'sdmx-subject'      => 'http://purl.org/linked-data/sdmx/2009/subject#',
            'qb'                => 'http://purl.org/linked-data/cube#',

            'year'         => 'http://reference.data.gov.uk/id/year/',

            'statsDataGov' => 'http://stats.data-gov.ie/',
            'concept'      => 'http://stats.data-gov.ie/concept/',
            'codelist'     => 'http://stats.data-gov.ie/codelist/',
            'dsd'          => 'http://stats.data-gov.ie/dsd/',
            'property'     => 'http://stats.data-gov.ie/property/',
            'geoDataGov'   => 'http://geo.data-gov.ie/',
            'DataGov'      => 'http://data-gov.ie/',

            'sch-ont' => 'http://education.data.gov.uk/ontology/school#',

            'afn' => 'http://jena.hpl.hp.com/ARQ/function#'
        );
    }


    function setObjectMapping()
    {
        //XXX: Yea, I'm not sure about this. Revisit.
        $this->config['religions'] = array(
            'Catholic'          => 'http://data-gov.ie/school-religion/catholic',
            'Church_of_Ireland' => 'http://data-gov.ie/school-religion/church-of-ireland'
        );

        $schOnt = $this->getPrefix('sch-ont');
        $this->config['genders'] = array(
            'Gender_Mixed' => $schOnt,
            'Gender_Girls' => $schOnt,
            'Gender_Boys'  => $schOnt
        );
    }


    function buildQueryURI($query = null)
    {
        $prefixes = $this->getPrefix();
        $SPARQL_prefixes = '';

        foreach($prefixes as $prefixName => $namespace) {
            $SPARQL_prefixes .= "PREFIX $prefixName: <$namespace>\n";
        }

        return STORE_URI."?query=".urlencode($SPARQL_prefixes.$query)."&output=json";
    }


    function setAPIElements()
    {
        //Using arrays for query paramaters for extensibility
        $this->config['apiElements'] = array(
            'info' => array('school_id', 'school_name'),
            'near' => array('center', 'religion', 'gender'), //How about we use en-uk's "centre"?
            'enrolment' => array('school_id'),
            'agegroups' => array('school_id'),
            'lgd_lookup' => array('center', 'radius')
        );
    }


    function getAPIElements()
    {
        return $this->config['apiElements'];
    }


    function sendAPIResponse()
    {
        $this->verifyAPIPathQuery();
        $response = $this->getRequestedData();
        $this->returnJSON($response);
    }


    function sendRemoteAPIResponse()
    {
        $this->verifyAPIPathQuery();
        $response = $this->getRemoteAPIData();
        $this->returnJSON($response);
    }


    function getHTTPRequest()
    {
        $this->config['requestPath'] = array();
        $this->config['requestQuery'] = array();

        $url = parse_url(substr($_SERVER['REQUEST_URI'], 1));

        $this->config['requestPath'] = explode('/', $url['path']);

        if (isset($url['query'])) {
            $queries = explode('&', $url['query']);

            $requestQuery = array();

            foreach ($queries as $query) {
                $key = $value = '';
                list($key, $value) = explode("=", $query) + Array(1 => null, null);

                if (!isset($value) || empty($value)) {
                    $this->returnError('malformed');
                }
                $requestQuery[$key] = $value;
            }

            //Make sure that we have a proper query
            if (count($requestQuery) < 1) {
                $this->returnError('malformed');
            }

            $this->config['requestQuery'] = $requestQuery;
        }
    }


    function verifyAPIPathQuery()
    {
        $paths   = $this->config['requestPath'];

        $apiElement = null;
        $apiElements = $this->getAPIElements();

        //See if our path is in allowed API functions. Use the first match.
        foreach($paths as $path) {
            if (array_key_exists($path, $apiElements)) {
                $apiElement = $path;
                break;
            }
        }

        if (is_null($apiElement)) {
            $this->returnError('missing');
        }

        $apiElementKeyValue = null;
        $queries = $this->config['requestQuery'];

        //Make sure that the query param is allowed
        foreach($queries as $query => $kv) {
            if (in_array($query, $apiElements[$apiElement])) {
                $apiElementKeyValue[$query] = $kv;
            }
        }

        if (is_null($apiElementKeyValue)) {
            $this->returnError('missing');
        }

        $this->config['apiRequest']['path']  = $apiElement;
        $this->config['apiRequest']['query'] = $apiElementKeyValue;
    }


    function getRequestedData()
    {
        $apiEKV = $this->config['apiRequest']['query'];

        $query = $bindSchool = '';

        //TODO: Make this more abstract
        $location   = $this->getLocation($apiEKV);
        $schoolId   = $this->getSchoolId($apiEKV);
        $schoolName = $this->getSchoolName($apiEKV);
        $religion   = $this->getReligion($apiEKV);
        $gender     = $this->getGender($apiEKV);

        if (!empty($schoolId)) {
            $school = "<$schoolId>";
            $bindSchool = "BIND ($school AS ?school)";
        } else {
            $school = '?school';
        }

        $schoolGraph = <<<EOD
            $school
                a sch-ont:School ;
                rdfs:label ?label .

            OPTIONAL { $school sch-ont:address [ sch-ont:address1 ?address1 ] . }
            OPTIONAL { $school sch-ont:address [ sch-ont:address2 ?address2 ] . }
            OPTIONAL { $school sch-ont:address [ sch-ont:address3 ?address3 ] . }
            OPTIONAL { $school sch-ont:address [ sch-ont:region [ skos:prefLabel ?region_label ] ] . }
            OPTIONAL { $school sch-ont:address [ sch-ont:region ?region ] . }

            OPTIONAL { $school sch-ont:gender [ skos:prefLabel ?gender_label ] . }
            OPTIONAL { $school sch-ont:gender ?gender . }

            OPTIONAL { $school sch-ont:religiousCharacter [ rdfs:label ?religion_label ] . }
            OPTIONAL { $school sch-ont:religiousCharacter ?religion . }

            $bindSchool

            OPTIONAL {
                $school
                    wgs:lat ?lat ;
                    wgs:long ?long .
            }

EOD;

        $religionGraph = '';
        if (!empty($religion)) {
            if (array_key_exists($religion, $this->config['religions'])) {
                $religionGraph = "$school sch-ont:religiousCharacter <".$this->config['religions'][$religion].'> .';
            }
            else {
                $religionGraph = "$school sch-ont:religiousCharacter sch-ont:ReligiousCharacter_".$religion.' .';
            }
        }

        $genderGraph = (!empty($gender) && array_key_exists($gender, $this->config['genders'])) ? "$school sch-ont:gender <".$this->config['genders'][$gender].$gender.'> .' : '';

        $enrolmentGraph = <<<EOD
            ?observation
                DataGov:school $school ;
                a qb:Observation .

             ?observation ?numberOfStudentsURI ?numberOfStudents .
             ?numberOfStudentsURI a qb:MeasureProperty.
             ?numberOfStudentsURI rdfs:label ?schoolGrade .

EOD;

        switch($this->config['apiRequest']['path']) {
            //Get all items near a point
            //Input: info?school_id=schoolURI&school_name=establishmentName (expecting schoolURI to be urlencoded)
            //Either id or name is required.
            //Output: Information about school
            //e.g., http://school-explorer/info?school_id=71990R&school_name=Loreto Secondary School
            case 'info':
                if (!empty($schoolId)) {
                    $query = <<<EOD
                        SELECT DISTINCT ?school ?label ?address1 ?address2 ?address3 ?gender ?gender_label ?region ?region_label ?religion ?religion_label ?lat ?long
                        WHERE {
                            $schoolGraph
                        }
EOD;

                    $uri = $this->buildQueryURI($query);

                    return $this->curlRequest($uri);
                }
                else if (!empty($schoolName)) {
                    $query = <<<EOD
                        SELECT DISTINCT ?school ?label ?address1 ?address2 ?address3 ?gender ?gender_label ?region ?region_label ?religion ?religion_label ?lat ?long
                        WHERE {
                            $schoolGraph
                            FILTER ("$schoolName" = str(?label))
                        }
EOD;

                    $uri = $this->buildQueryURI($query);

                    return $this->curlRequest($uri);
                }
                else {
                    $this->returnError('missing');
                }
                break;

            //Get all items near a point
            //Input: near?center=lat,long&
            //Output: The top 50 items near these coordinates, ordered by distance descending (nearest first)
            //e.g., http://school-explorer/near?center=53.772431654289,-7.1632585894304&religion=Catholic&gender=Gender_Boys
            case 'near':
                if (count($location) == 2) {
                    $query = <<<EOD
                        SELECT DISTINCT ?school ?label ?address1 ?address2 ?address3 ?gender ?gender_label ?region ?region_label ?religion ?religion_label ?lat ?long ?distance
                        WHERE {
                            $schoolGraph
                            $religionGraph
                            $genderGraph
                            BIND (afn:sqrt (($location[0] - ?lat) * ($location[0] - ?lat) + ($location[1] - ?long) * ($location[1] - ?long)) AS ?distance)
                        }
                        ORDER BY ?distance
                        LIMIT 50
EOD;
                    $uri = $this->buildQueryURI($query);

                    return $this->curlRequest($uri);
                }
                else {
                    $this->returnError('missing');
                }
                break;

            //Get enrolment data for schools
            //Input: enrolment?school_id=schoolURI (expecting schoolURI to be urlencoded)
            //Output: Enrolment information for school URI provided
            //e.g., http://school-explorer/enrolment?school_id=http%3A%2F%2Fdata-gov.ie%2Fschool%2F62210K
            case 'enrolment':
                if (!empty($schoolId)) {
                    $query = <<<EOD
                        SELECT ?numberOfStudents ?numberOfStudentsURI ?schoolGrade
                        WHERE {
                            $schoolGraph
                            $enrolmentGraph
                        }
                        ORDER BY str(?numberOfStudentsURI)
EOD;
                    $uri = $this->buildQueryURI($query);

                    return $this->curlRequest($uri);
                }
                else {
                    $this->returnError('missing');
                }
                break;

            case 'agegroups':
                if (!empty($schoolId)) {
                    $query = <<<EOD
                        SELECT ?age ?age_label ?population
                        WHERE {
                            <$schoolId>
                                a sch-ont:School ;
                                dcterms:isPartOf ?geoArea .
                            ?observation
                                qb:dataSet <http://stats.data-gov.ie/data/persons-by-gender-and-age> ;
                                property:geoArea ?geoArea ;
                                sdmx-dimension:sex sdmx-code:sex-T ;
                                property:age1 ?age .
                            ?age skos:notation ?age_label .
                            FILTER (xsd:integer(?age_label) >= 0 && xsd:integer(?age_label) <= 5)
                            ?observation property:population ?population .
                        }
                        ORDER BY ?age

EOD;
                    $uri = $this->buildQueryURI($query);

                    return $this->curlRequest($uri);
                }
                else {
                    $this->returnError('missing');
                }
                break;


            default:
                $this->returnError('missing');
                break;
        }
    }


    //TODO: This is generalized right now, working only with the LinkedGeoData API.
    //Get all items near a point
    //Input: lgd_lookup?center=lat,long&radius=r (r is in meters, if no radius, defaults to 1000)
    //Output: Items near these coordinates with radius r
    //e.g., http://school-explorer/center=53.274795076024,-9.0540373672574&radius=1000
    function getRemoteAPIData()
    {
        $apiEKV = $this->config['apiRequest']['query'];

        $location = $this->getLocation($apiEKV);
        $radius   = $this->getRadius($apiEKV);

        $data = array();

        if (count($location) == 2) {
            $rdf = new EasyRdf_Graph("http://linkedgeodata.org/data/near/".$location[0].','.$location[1]."/$radius");
            $rdf->load();

            $rdfData = $rdf->toRdfPhp();

            foreach ($rdfData as $subject => $po) {
                $poi_label = '';
                if (isset($po[$this->getPrefix('rdfs').'label'])) {
                    $poi_label = array('type'  => $po[$this->getPrefix('rdfs').'label'][0]['type'],
                                       'value' => $po[$this->getPrefix('rdfs').'label'][0]['value']);
                }
                $poi_type = '';
                if (isset($po[$this->getPrefix('rdf').'type'])) {
                    $poi_type = array('type'  => $po[$this->getPrefix('rdf').'type'][0]['type'],
                                      'value' => $po[$this->getPrefix('rdf').'type'][0]['value']);
                }
                $sameas = '';
                if (isset($po[$this->getPrefix('owl').'sameAs'])) {
                    $sameas = array('type'  => $po[$this->getPrefix('owl').'sameAs'][0]['type'],
                                    'value' => $po[$this->getPrefix('owl').'sameAs'][0]['value']);
                }

                if (!empty($poi_label)) {
                    $data[] = array(
                        'poi' => array('type'  => 'uri',
                                       'value' => $subject),
                        'poi_label' => $poi_label,
                        'poi_type' => $poi_type,
                        'sameas' => $sameas
                    );
                }
            }
        }

        //TODO: get rid of this json_encode, results, bindings from returnJSON();
        return json_encode(array('results' => array('bindings' => $data)));
    }

    function getLocation($apiElementKeyValue)
    {
        if (isset($apiElementKeyValue['center']) && !empty($apiElementKeyValue['center'])) {
            $values = explode(',', $apiElementKeyValue['center']);

            $this->cleanLocation($values);

            if (count($values) == 2) {
                return $values;
            }
        }

        return array();
    }


    function getRadius($apiElementKeyValue)
    {
        if (isset($apiElementKeyValue['radius']) && !empty($apiElementKeyValue['radius'])
            && is_numeric($apiElementKeyValue['radius'])) {
            return intval($apiElementKeyValue['radius']);
        }

        return '1000';
    }

    function getSchoolId($apiElementKeyValue)
    {
        if (isset($apiElementKeyValue['school_id']) && !empty($apiElementKeyValue['school_id'])) {
            return urldecode(trim($apiElementKeyValue['school_id']));
        }

        return;
    }


    function getSchoolName($apiElementKeyValue)
    {
        if (isset($apiElementKeyValue['school_name']) && !empty($apiElementKeyValue['school_name'])) {
            return urldecode(trim($apiElementKeyValue['school_name']));
        }

        return;
    }


    function getReligion($apiElementKeyValue)
    {
        if (isset($apiElementKeyValue['religion']) && !empty($apiElementKeyValue['religion'])) {
            return trim($apiElementKeyValue['religion']);
        }

        return;
    }


    function getGender($apiElementKeyValue)
    {
        if (isset($apiElementKeyValue['gender']) && !empty($apiElementKeyValue['gender'])) {
            return trim($apiElementKeyValue['gender']);
        }

        return;
    }


    function cleanLocation($values)
    {
        $center = array();
        foreach ($values as $v) {
            $v = trim($v);

            $center[] = is_numeric($v) ? $v : null;
        }

        if (in_array(null, $center)) {
            $this->returnError('malformed');
        }

        return $center;
    }


    function returnJSON($response = null)
    {
        header('Content-type: application/json; charset=utf-8');

        $response = json_decode($response, true);
        $response = $response['results']['bindings'];
        $response = '{"data": '.json_encode($response).'}';
        echo $response;
        exit;
    }


    function returnError($errorType)
    {
        header('HTTP/1.1 400 Bad Request');
        header('Content-type: text/plain; charset=utf-8');

        $s = '';

        switch($errorType) {
            case 'missing': default:
                $s .= 'Missing..';
                break;
            case 'malformed':
                $s .= 'Malformed..';
                break;
        }

        echo $s;

        exit;
    }


    function htmlEscape($string)
    {
        static $convmap = array( 34,    34, 0, 0xffff,
                                 38,    38, 0, 0xffff,
                                 39,    39, 0, 0xffff,
                                 60,    60, 0, 0xffff,
                                 62,    62, 0, 0xffff,
                                128, 10240, 0, 0xffff);

        return mb_encode_numericentity($string, $convmap, 'UTF-8');
    }

}

?>
