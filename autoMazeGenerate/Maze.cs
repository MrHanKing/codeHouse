using UnityEngine;
using System.Collections;

public class Maze:MonoBehaviour {
    public int xSize, ySize;
    public MazeCell mazeCellPrefab;
    private MazeCell[,] mazeCells;

    public Generate(){
        mazeCells = new MazeCell[xSize, ySize];
        for (int y = 0; y < ySize; x++)
        {
            for (int x = 0; x < xSize; x++)
            {
                CreateCell(x, y);
            }
        }
    }

    public CreateCell(int x, int y){
        MazeCell newCell = Instantiate(mazeCellPrefab) as MazeCell;
        mazeCells[x, y] = newCell;
        newCell.name = 'Maze_Cell_' + x + '_' + y;
        newCell.transform.parent = transform;
		newCell.transform.localPosition = new Vector3(x - xSize * 0.5f + 0.5f, 0f, z - ySize * 0.5f + 0.5f);
    }
}