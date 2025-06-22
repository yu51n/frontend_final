<?php
namespace vendor;
use vendor\Controller;
use \PDO;
use \PDOException;
class DB extends Controller{
    public static $dbHost;
    public static $dbName;
    public static $dbUser;
    public static $dbPassword;
    private static $conn = NULL;
    static function connect(){
        if(self::$conn != NULL) return;
        $dsn = sprintf("mysql:host=%s;dbname=%s;charset=utf8", self::$dbHost, self::$dbName);
        try {
            self::$conn = new PDO($dsn, self::$dbUser, self::$dbPassword);
        } catch (PDOException $e) {
            self::$conn = NULL;
        }
    }
    static function select($sql,$args){
        self::connect();
        if (self::$conn==NULL) return self::response(14, "無法開啟DB");
        $stmt = self::$conn->prepare($sql);
        $result = $stmt->execute($args);
        if ($result) {
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return self::response(200, "查詢成功", $rows);
        } else {
            return self::response(400, "SQL錯誤");
        }
    }
    static function insert($sql, $args){
        self::connect();
        if (self::$conn==NULL) return self::response(14, "無法開啟DB");
        $stmt = self::$conn->prepare($sql);
        $result = $stmt->execute($args);
        return self::check("新增",$result,$stmt);
    }
    static function delete($sql, $args){
        self::connect();
        if (self::$conn==NULL) return self::response(14, "無法開啟DB");
        $stmt = self::$conn->prepare($sql);
        $result = $stmt->execute($args);
        return self::check("刪除",$result,$stmt);
    }
    static function update($sql, $args){
        self::connect();
        if (self::$conn==NULL) return self::response(14, "無法開啟DB");
        $stmt = self::$conn->prepare($sql);
        $result = $stmt->execute($args);
        return self::check("更新",$result,$stmt);
    }
    static function check($action,$result,$stmt){
        if ($result) {
            $count = $stmt->rowCount();
            return ($count < 1) ? self::response(204, $action."失敗") : self::response(200, $action."成功");
        } else {
            return self::response(400, "SQL錯誤");
        }
    }
}
