using System;

namespace TestingAfter
{
    class GenericProperty
    {
        private List<int> list;

        public List<int> GetList() { return this.list; }
        public void SetList(List<int> list) { this.list = list; }
    }
}