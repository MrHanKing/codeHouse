using UnityEngine;

public enum MazeDirection {
	North,
	East,
	South,
	West
}

public static class MazeDirections {

	public const int Count = 4;

	public static MazeDirection RandomValue {
		get {
			return (MazeDirection)Random.Range(0, Count);
		}
	}

    private static IntVec2[] vectors = {
		new IntVec2(0, 1),
		new IntVec2(1, 0),
		new IntVec2(0, -1),
		new IntVec2(-1, 0)
	};

	public static IntVec2 ToIntVector2 (MazeDirection direction) {
		return vectors[(int)direction];
	}
}