<?php
require_once __DIR__ . '/../vendor/Autoload.php';

use vendor\DB;
use vendor\Router;
use Middlewares\AuthMiddleware;

class Main{
    static function run(){
        //讀取.env, 設定相關config
        $conf =  parse_ini_file(__DIR__ . '/../vendor/.env');
        DB::$dbHost = $conf['dbHost'];
        DB::$dbName = $conf['dbName'];
        DB::$dbUser = $conf['dbUser'];
        DB::$dbPassword = $conf['dbPassword'];

        if(isset($_GET['action']))
            $action = $_GET['action'];
        else
            $action = "no_action";

        //檢查token是否有效，除了 registerUser 和 doLogin
        if ($action === 'registerUser') {
            $router = new Router();
            require_once __DIR__ . "/../routes/web.php";
            $response = $router->run($action);
        } else if ($action === 'doLogin') {
            $response = AuthMiddleware::doLogin();
        } else {
            $response = $responseToken = AuthMiddleware::checkToken();
            if($responseToken['status'] == 200){
                if($action != "no_action") { 
                    $response = AuthMiddleware::checkPrevilege($action);
                    if($response['status'] == 200){
                        $router = new Router();
                        require_once __DIR__ . "/../routes/web.php";
                        $response = $router->run($action);
                    }
                }
                $response['token'] = $responseToken['token'];
            }
        }
        echo json_encode($response);
    }
}