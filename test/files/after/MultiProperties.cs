using System;

namespace TestingAfter
{
    class MultiProperties
    {
        private int first;
        private int second;

        public int GetFirst() { return this.first; }
        public void SetFirst(int first) { this.first = first; }

        public int GetSecond() { return this.second; }
        public void SetSecond(int second) { this.second = second; }
    }
}