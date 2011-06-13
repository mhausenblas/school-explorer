<?php
ini_set('display_errors', '1');

require_once 'classes/SchoolExplorer.php';

$SE = new SchoolExplorer();


$paths = explode('/', substr($_SERVER['REQUEST_URI'], 1));
switch($paths[0]) {
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

    default: //home
        require_once 'templates/page.home.html';
        break;
}
?>
