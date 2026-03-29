<?php
require_once "../config/cors.php";
require_once "../helpers/response.php";

session_start();
session_unset();
session_destroy();

jsonResponse(true, "Logged out successfully");