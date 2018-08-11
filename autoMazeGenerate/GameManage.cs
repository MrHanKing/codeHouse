using UnityEngine;
using System.Collections;

public class GameManage:MonoBehaviour{
    public Maze mazePrefab;

    private Maze mazeInstance;

    public BeginGame(){
        mazeInstance = Instantiate(mazePrefab) as Maze;
        mazeInstance.Generate();
    }

    public RestartGame(){
        Destroy(mazeInstance.gameObject);
        BeginGame();
    }
}