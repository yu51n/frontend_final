<?php
namespace Controllers;
use vendor\Controller;
use Models\BookModel;

class Book extends Controller
{
    private $em;
    public function __construct() {
        $this->em = new BookModel();
    }
    public function getBooks(){
        if(isset($_GET["id"])){
            $book=$this->em->getBook(array(":id"=>$_GET["id"]));
            if($book["status"]==200){
                $categoris=$this->em->getBookCategoris(array(":id"=>$_GET["id"]));
                if($categoris["status"]==200){
                    $ans=array("book"=>$book["result"],"categories"=>$categoris["result"]);
                    return self::response(200,"查詢成功",$ans);
                }
                return self::response(204,"查詢標籤失敗");
            }
            return $book;
        }
        else{
            $books = $this->em->getBooks();
            if ($books["status"] == 200) {
                foreach ($books["result"] as &$book) {
                    $tmp = $this->em->getBookCategoris(array(":id" => $book["id"]));
                    if ($tmp["status"] == 200) {
                        // 讓每本書直接帶有 categories 陣列（含 id, name）
                        $book["categories"] = $tmp["result"];
                    } else {
                        $book["categories"] = [];
                    }
                }
                unset($book); // 解除引用
                $ans = array("books" => $books["result"]);
                return self::response(200, "查詢成功", $ans);
            }
            return $books;
        }
    }
    public function newBook() {
        if(isset($_POST["id"],$_POST["title"],$_POST["author_id"],$_POST["categories"])){
            $book = $this->em->getBook(array(":id"=>$_POST["id"]));
            if(!empty($book["result"])){
                return self::response(204,"書本id已存在");
            }
            $newbook=$this->em->newBook(array("id"=>$_POST["id"],"title"=>$_POST["title"],"author_id"=>$_POST["author_id"]));
            if($newbook["status"]==200){
                // 修正：確保 categories 一定是陣列
                $categories = $_POST["categories"];
                if(is_string($categories)){
                    $categories = explode(',', $categories);
                }
                foreach($categories as $val){
                    $newcategoris=$this->em->newBookCategoris(array(":book_id"=>$_POST["id"],":category_id"=>$val));
                    if($newcategoris["status"]==204){
                        return $newcategoris;
                    }
                }
            }
            return $newbook;
        }
        else{
            return self::response(204,"輸入的參數不完全");
        }
    }
    function removeBook() {
        if(isset($_GET["id"])){
            return $this->em->removeBook(array(":id"=>$_GET["id"]));
        }
        else{
            return self::response(204,"未帶id的請求");
        }
    }
    function updateBook() {
        if(isset($_POST["id"],$_POST["title"],$_POST["author_id"],$_POST["categories"],$_POST["preid"])){
            $updatebook = $this->em->updateBook(array(
                ":title"=>$_POST["title"],
                ":author_id"=>$_POST["author_id"],
                ":id"=>$_POST["id"],
                ":preid"=>$_POST["preid"]
            ));
            // 只要不是 SQL 錯誤就繼續（status==200 或 message=="更新失敗" 但沒有 exception）
            if($updatebook["status"]==200 || $updatebook["message"]=="更新失敗"){
                $deletecategories = $this->em->removeBookCategoris(array("book_id"=>$_POST["id"]));
                if($deletecategories["status"]==200){
                    $categories = $_POST["categories"];
                    if(is_string($categories)){
                        $categories = explode(',', $categories);
                    }
                    foreach($categories as $val){
                        $newcategoris = $this->em->newBookCategoris(array(
                            ":book_id"=>$_POST["id"],
                            ":category_id"=>$val
                        ));
                        if($newcategoris["status"]==204){
                            return $newcategoris;
                        }
                    }
                }
                return self::response(200,"修改成功");
            }
            return $updatebook;
        }
        else{
            return self::response(204,"輸入的參數不完全");
        }
    }
}