using System;
using System.Collections.Generic;

namespace IFC4x2.Net
{
    public class ExpressBase<T>
    {
        public T Value;

        public ExpressBase(T value){
            Value = value;
        }

        public static implicit operator T(ExpressBase<T> e) => e.Value;
        public static implicit operator ExpressBase<T>(T b) => new ExpressBase<T>(b); 

    }

    #region Primitives

    public class eString : ExpressBase<string>
    {
        private bool Fixed;
        private double? Length; 
        public eString(string value) : base(value)
        {
        }
    }
    public class eDouble : ExpressBase<double>
    {
        public eDouble(double value) : base(value)
        {
        }
    }
    public class eInteger : ExpressBase<int>
    {
        public eInteger(int value) : base(value)
        {
        }
    }    
    public class eBoolean : ExpressBase<bool>
    {
        public eBoolean(bool value) : base(value)
        {
        }
    }

    #endregion

    #region Collections

    public class eList<T> : ExpressBase<List<T>>
    {
        public eList(List<T> value) : base(value)
        {
        }
    }
    public class eSet<T> : ExpressBase<List<T>>
    {
        public eSet(List<T> value) : base(value)
        {
        }
    }
    public class eArray<T> : ExpressBase<T[]>
    {
        public eArray(T[] value) : base(value)
        {
        }
    }
    public class eBag<T> : ExpressBase<T[]>
    {
        public eBag(T[] value) : base(value)
        {
        }
    }

    #endregion

}
