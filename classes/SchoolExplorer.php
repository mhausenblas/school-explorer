<?php

class SchoolExplorer
{
    var $config;

    function __construct()
    {
        define('STORE_URI', 'http://data-gov.ie/sparql');

        $this->config = array();
        $this->setPrefixes();
        $this->setAPIElements();
        $this->getHTTPRequest();

        switch($this->config['requestPath'][0]) {
            case 'about':
                require_once 'templates/page.about.html';
                break;

            case 'school':
                require_once 'templates/page.school.html';
                break;

            case 'area':
                require_once 'templates/page.area.html';
                break;

            case 'map':
                require_once 'templates/page.map.html';
                break;

            case 'near':
                $this->sendAPIResponse();
                break;

            case 'info':
                $this->sendAPIResponse();
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
    <http://govdata.ie/school/$paths[1]> ?property ?object .
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

            'statsDataGov' => 'http://stats.govdata.ie/',
            'concept'      => 'http://stats.govdata.ie/concept/',
            'codelist'     => 'http://stats.govdata.ie/codelist/',
            'dsd'          => 'http://stats.govdata.ie/dsd/',
            'property'     => 'http://stats.govdata.ie/property/',
            'geoDataGov'   => 'http://geo.govdata.ie/',

            'sch-ont' => 'http://education.data.gov.uk/ontology/school#'
        );
    }


    function buildQueryURI($query = null)
    {
        $prefixes = $this->getPrefix();
        $SPARQL_prefixes = '';

        foreach($prefixes as $prefixName => $namespace) {
            $SPARQL_prefixes .= "PREFIX $prefixName: <$namespace>\n";
        }

//        $query = preg_replace("#<URI>#", "<$uri>", $SPARQL_prefixes.$this->config['sparql_query'][$type]);

        return STORE_URI."?query=".urlencode($SPARQL_prefixes.$query)."&output=json";
    }


    function setAPIElements()
    {
        //Using arrays for query paramaters for extensibility
        $this->config['apiElements'] = array(
            'info' => array('location'),
            'near' => array('center') //How about we use en-uk's "centre"?
        );
    }


    function getAPIElements()
    {
        return $this->config['apiElements'];
    }


    function sendAPIResponse()
    {
        $response = $this->getRequestedData();
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


    function getRequestedData()
    {
        $paths   = $this->config['requestPath'];
        $queries = $this->config['requestQuery'];

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

        //Make sure that the query param is allowed
        foreach($queries as $query => $kv) {
            if (in_array($query, $apiElements[$apiElement])) {
                $apiElementKeyValue[$query] = $kv;
            }
        }

        if (is_null($apiElementKeyValue)) {
            $this->returnError('missing');
        }

        $query = '';
        $values = explode(',', implode(',', array_values($apiElementKeyValue)));

        switch($apiElement) {
            //Get all items near a point
            //Input: near?center=lat,long
            //Output: The top 50 items near these coordinates, ordered by distance descending (nearest first)
            //e.g., http://school-explorer/info?location=53.2744122,-9.0490632
            case 'info':
                if (count($values) == 2) {
                    $center = $this->cleanLocation($values);

                    $query = <<<EOD
                        SELECT ?point ?property ?object
                        WHERE {
                            ?point wgs:lat "$center[0]"^^xsd:decimal .
                            ?point wgs:long "$center[1]"^^xsd:decimal .
                            ?point ?property ?object .
                        }
EOD;
                    $uri = $this->buildQueryURI($query);

                    return $this->curlRequest($uri);
                }
                else {
                    $this->returnError('missing');
                }
                break;

            case 'near':
                if (count($values) == 2) {
                    $center = $this->cleanLocation($values);

                    $query = <<<EOD
                        SELECT ?school ?property ?object
                        WHERE {
                            ?school a sch-ont:School .
                            ?school ?property ?object .
                            FILTER (
                                ?point wgs:lat "$center[0]"^^xsd:decimal and
                                ?point wgs:long "$center[1]"^^xsd:decimal .
                            )
                        }

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
