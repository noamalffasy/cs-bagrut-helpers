using System;

namespace TestingAfter
{
    class ConstructorAndProperty
    {
        private int name;

        public ConstructorAndProperty() { }

        public int GetName() { return this.name; }
        public void SetName(int name) { this.name = name; }
    }
}