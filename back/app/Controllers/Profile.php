<?php
namespace Controllers;
use vendor\Controller;
use Models\ProfileModel;
use Middlewares\AuthMiddleware; 

class Profile extends Controller
{
    private $em;
    public function __construct() {
        $this->em = new ProfileModel();
    }
    public function getProfile() {
        // 取得目前登入者 id
        $user = AuthMiddleware::checkToken();
        if ($user['status'] !== 200) {
            return [
                'status' => 401,
                'message' => '未登入'
            ];
        }
        $id = is_object($user['user']) ? $user['user']->id : $user['user']['id'];
        return $this->em->getProfile($id);
    }
    public function removeProfile() {
        $user = AuthMiddleware::checkToken();
        if ($user['status'] !== 200) {
            return [
                'status' => 401,
                'message' => '未登入'
            ];
        }
        $id = is_object($user['user']) ? $user['user']->id : $user['user']['id'];
        return $this->em->removeProfile($id);
    }
    public function updateProfile() {
        $user = AuthMiddleware::checkToken();
        if ($user['status'] !== 200) {
            return [
                'status' => 401,
                'message' => '未登入'
            ];
        }
        $id = is_object($user['user']) ? $user['user']->id : $user['user']['id'];
        if(isset($_POST["id"],$_POST["password"],$_POST["email"],$_POST["name"],$_POST["preid"])){
            // 僅允許本人修改自己的資料
            if ($_POST["preid"] !== $id) {
                return self::response(403,"沒有權限修改他人資料");
            }
            $result = $this->em->updateProfile(array(
                ":id"=>$_POST["id"],
                ":password"=>$_POST["password"],
                ":email"=>$_POST["email"],
                ":name"=>$_POST["name"],
                ":preid"=>$_POST["preid"]
            ));
            // 更新成功後重新簽發 JWT
            if($result["status"]==200){
                $newToken = AuthMiddleware::genToken($_POST["id"]);
                $result["token"] = $newToken;
            }
            return $result;
        } else {
            return self::response(204,"輸入的參數不完全");
        }
    }
}
?>