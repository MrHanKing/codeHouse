using System;

[System.Serializable]
public struct IntVec2
{
    int x, z;

    public IntVec2(int x, int z){
        this.x = x;
        this.z = z;
    }

    public static IntVec2 operator + (IntVec2 a, IntVec2 b){
        a.x += b.x;
        a.z += b.z;
        return a;
    }
}