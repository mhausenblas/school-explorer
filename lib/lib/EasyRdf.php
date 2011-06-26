<?php

/**
 * EasyRdf
 *
 * Use this file to load the core of EasyRdf, if you don't have an autoloader.
 *
 *
 * LICENSE
 *
 * Copyright (c) 2009-2010 Nicholas J Humfrey.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 3. The name of the author 'Nicholas J Humfrey" may be used to endorse or
 *    promote products derived from this software without specific prior
 *    written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * @package    EasyRdf
 * @copyright  Copyright (c) 2010 Nicholas J Humfrey
 * @license    http://www.opensource.org/licenses/bsd-license.php
 * @version    $Id$
 */

/**
 * @see EasyRdf_Exception
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Exception.php";

/**
 * @see EasyRdf_Format
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Format.php";

/**
 * @see EasyRdf_Graph
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Graph.php";

/**
 * @see EasyRdf_GraphStore
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/GraphStore.php";

/**
 * @see EasyRdf_Http
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Http.php";

/**
 * @see EasyRdf_Http_Client
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Http/Client.php";

/**
 * @see EasyRdf_Http_Response
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Http/Response.php";

/**
 * @see EasyRdf_Literal
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Literal.php";

/**
 * @see EasyRdf_Namespace
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Namespace.php";

/**
 * @see EasyRdf_Parser
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Parser.php";

/**
 * @see EasyRdf_Parser_RdfPhp
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Parser/RdfPhp.php";

/**
 * @see EasyRdf_Parser_Ntriples
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Parser/Ntriples.php";

/**
 * @see EasyRdf_Parser_Json
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Parser/Json.php";

/**
 * @see EasyRdf_Parser_RdfXml
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Parser/RdfXml.php";

/**
 * @see EasyRdf_Resource
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Resource.php";

/**
 * @see EasyRdf_Serialiser
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Serialiser.php";

/**
 * @see EasyRdf_Serialiser_RdfPhp
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Serialiser/RdfPhp.php";

/**
 * @see EasyRdf_Serialiser_Ntriples
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Serialiser/Ntriples.php";

/**
 * @see EasyRdf_Serialiser_Json
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Serialiser/Json.php";

/**
 * @see EasyRdf_Serialiser_RdfXml
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Serialiser/RdfXml.php";

/**
 * @see EasyRdf_Serialiser_Turtle
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Serialiser/Turtle.php";

/**
 * @see EasyRdf_SparqlClient
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/SparqlClient.php";

/**
 * @see EasyRdf_SparqlResult
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/SparqlResult.php";

/**
 * @see EasyRdf_TypeMapper
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/TypeMapper.php";

/**
 * @see EasyRdf_Utils
 */
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . "EasyRdf/Utils.php";
