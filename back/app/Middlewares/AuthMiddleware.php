<?php
namespace Middlewares;
use \Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use vendor\Controller;
use \PDO;
use vendor\DB;
use Models\UserModel as UserModel;
use Models\Action;


class AuthMiddleware extends Controller{
    private static $id;

    public static function checkPrevilege($action){
        $id = self::$id;
        // 取得使用者所隷屬的角色id
        $em = new UserModel();
        $response = $em->getRoles($id);
        $user_roles = $response['result'];
        // 取得可執行action的角色id
        $am = new Action();
        $response = $am->getRoles($action);
        $action_roles = $response['result'];
        // 判斷user_roles與action_roles兩者是否有交集，有交集代表有權限，無交集代表無權限
        $r = array_intersect($user_roles, $action_roles);
        if(count($r)!=0){
            return self::response(200, '有權限');
        }
        else{
            return self::response(403, '沒有權限');
        }
    }

    public static function checkToken(){
        $headers = getallheaders();
        if (!isset($headers['Authorization'])) {
            if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $headers['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
            } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
                $headers['Authorization'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            }
        }
        if (!isset($headers['Authorization'])) {
            return [
                'status' => 401,
                'message' => 'Authorization header missing'
            ];
        }

        // 驗證JWT
        try {
            $secret_key = "YOUR_SECRET_KEY";
            $jwt = $headers['Authorization'];
            $decoded = JWT::decode($jwt, new Key($secret_key, 'HS256'));
            self::$id =  $decoded->data->id;
            return [
                'status' => 200,
                'message' => 'Access granted',
                'token' => $jwt,
                'user' => $decoded->data
            ];
        } catch (\Exception $e) {
            return [
                'status' => 401,
                'message' => 'Token 驗證失敗'
            ];
        }
    }
    public static function doLogin(){
        $id = $_POST['id'] ?? '';
        $password = $_POST['password'] ?? '';

        // 使用 Model 驗證帳密
        $em = new UserModel();
        $response = $em->checkIdPw($id, $password);

        if($response['status'] == 200){
            // 登入成功，產生 JWT
            $jwt = self::genToken($id);
            return [
                'status' => 200,
                'message' => 'Access granted',
                'token' => $jwt
            ];
        } else {
            // 登入失敗
            return [
                'status' => 401,
                'message' => '帳號密碼錯誤或無此帳號'
            ];
        }
    }
    public static function genToken($id){
        $secret_key = "YOUR_SECRET_KEY";
        $issuer_claim = "http://localhost";
        $audience_claim = "http://localhost";
        $issuedat_claim = time(); // issued at
        $expire_claim = $issuedat_claim + 3600;
        $payload = array(
            "iss" => $issuer_claim,
            "aud" => $audience_claim,
            "iat" => $issuedat_claim,
            "exp" => $expire_claim,
            "data" => array(
                "id" => $id,
            )
        );
        $jwt = JWT::encode($payload, $secret_key, 'HS256');
        return $jwt;
    }
}
