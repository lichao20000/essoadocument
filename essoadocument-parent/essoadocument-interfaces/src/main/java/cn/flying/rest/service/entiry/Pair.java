package cn.flying.rest.service.entiry;


/**
 * @see  这是一个常用的成对数据 
 * @param <T1>
 * @param <T2>
 */
@SuppressWarnings("unchecked")
public class Pair<T1, T2> {
public T1 left = null;
public T2 right = null;
public Object relation = null;
public Pair(){}
public Pair( T1 t1, T2 t2 )
{
    left=t1;
    right=t2;
}

public boolean equals(Object o){
	if(o == this)return true;
	if(o == null) return false;
	if(!(o instanceof Pair))return false;
	@SuppressWarnings("rawtypes")
  Pair p = (Pair)o;
	if( p.left == left && p.right == right ) return true;
    if(left == null || right == null || p.left == null || p.right == null)return false;
    return left.equals(p.left)&& right.equals(p.right);
}

public int hashCode()
{
	if(left==null){
		if(right==null)return 0;
		return right.hashCode() ^ 789;
	}
	if(right==null)return left.hashCode() ^ 987;
    return left.hashCode()^right.hashCode() ;
}

public Pair<T1, T2> clone(){
	Pair<T1, T2> p = new Pair<T1, T2>(left, right);
	p.relation = this.relation;
	return p;
}

public Pair<T1, T2> setLeft(T1 _a){
	left = _a;
	return this;
}

public Pair<T1, T2> setRight(T2 _b){
	right = _b;
	return this;
}

public Pair<T1, T2> set(T1 _a, T2 _b){
	left = _a;
	right = _b;
	return this;
}

public Pair<T1, T2> copy(Pair<T1, T2> p){
	this.relation = p.relation;
	return set(p.left, p.right);
}

public String toString(){
	StringBuffer buffer = new StringBuffer("Pair.left=");
	buffer.append(this.left + "\r\n");
	buffer.append("Pair.right=" + this.right);
	return buffer.toString();
}
public static void main (String[] args) {
	@SuppressWarnings("rawtypes")
  Pair p = new Pair("left",null) ;
	System.out.print(p) ;
}
}
