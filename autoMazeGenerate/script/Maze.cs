using UnityEngine;
using System.Collections;

public class Maze:MonoBehaviour {
    public IntVec2 size;
    public MazeCell mazeCellPrefab;
    private MazeCell[,] mazeCells;

    // 随机坐标
    private IntVec2 RandomCoordinate{
        get{
            return new IntVec2(Random.range(0, size.x), Random.range(0, size.z));
        }
    }

    public bool ContainsCoordinates (IntVec2 coordinate) {
		return coordinate.x >= 0 && coordinate.x < size.x && coordinate.z >= 0 && coordinate.z < size.z;
	}
    
    public Generate(){
        mazeCells = new MazeCell[size.x, size.z];
        // 生成随机坐标
        IntVec2 aRandCoord = RandomCoordinate;
        while (ContainsCoordinates(aRandCoord)) {
			CreateCell(aRandCoord);
			aRandCoord.z += 1;
		}
    }

    public CreateCell(IntVec2 coordinate){
        MazeCell newCell = Instantiate(mazeCellPrefab) as MazeCell;
        mazeCells[coordinate.x, coordinate.z] = newCell;
        newCell.coordinate = coordinate;
        newCell.name = 'Maze_Cell_' + coordinate.x + '_' + coordinate.z;
        newCell.transform.parent = transform;
		newCell.transform.localPosition = 
            new Vector3(coordinate.x - size.x * 0.5f + 0.5f, 0f, coordinate.z - size.z * 0.5f + 0.5f);
    }
}