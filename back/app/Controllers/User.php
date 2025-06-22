<?php
namespace Controllers;
use vendor\Controller;
use Models\UserModel;
use Middlewares\AuthMiddleware;

class User extends Controller
{
    private $em;
    public function __construct() {
        $this->em = new UserModel();
    }
    public function getUsers() {
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            return $this->em->getUser($id);
        } else {
            return $this->em->getUsers();
        }
    }
    public function newUser() {
        $id = $_POST['id'];
        $password = $_POST['password'];
        $email = $_POST['email'];
        $name = $_POST['name'];
        return $this->em->newUser($id, $password, $email, $name);
    }
    public function removeUser() {
        // 權限驗證
        $user = \Middlewares\AuthMiddleware::checkToken();
        if ($user['status'] !== 200) {
            return [
                'status' => 401,
                'message' => '未登入'
            ];
        }
        $roles = (new \Models\UserModel())->getRoles($user['user']->id)['result'];
        if (!in_array(1, $roles)) {
            return [
                'status' => 403,
                'message' => '沒有權限'
            ];
        }
        // 這裡同時支援 GET 和 POST
        $id = $_POST['id'] ?? $_GET['id'] ?? null;
        if (!$id) {
            return [
                'status' => 400,
                'message' => '未帶id的請求'
            ];
        }
        return $this->em->removeUser($id);
    }
    public function updateUser() {
        if(isset($_POST["id"],$_POST["password"],$_POST["email"],$_POST["name"],$_POST["preid"])){
            return $this->em->updateUser(array(
                ":id"=>$_POST["id"],
                ":password"=>$_POST["password"],
                ":email"=>$_POST["email"],
                ":name"=>$_POST["name"],
                ":preid"=>$_POST["preid"]
            ));
        } else {
            return self::response(204,"輸入的參數不完全");
        }
    }
    public function registerUser() {
    $id = $_POST['id'] ?? '';
    $password = $_POST['password'] ?? '';
    $email = $_POST['email'] ?? '';
    $name = $_POST['name'] ?? '';
    if (!$id || !$password || !$email || !$name) {
        return [
            'status' => 400,
            'message' => '請確認所有欄位都已填寫'
        ];
    }
    return $this->em->newUser($id, $password, $email, $name);
    }
}
?>