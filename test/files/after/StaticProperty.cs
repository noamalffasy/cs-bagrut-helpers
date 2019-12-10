using System;

namespace TestingAfter
{
    class StaticProperty
    {
        private static int num;

        public int GetNum() { return num; }
        public void SetNum(int num) { num = num; }
    }
}