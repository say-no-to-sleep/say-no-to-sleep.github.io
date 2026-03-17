
# Merge Sort

Merge sort follows the divide-and-conquer pattern.

## Core Idea

| Phase | What happens |
| ----- | ------------ |
| Divide | Split the array in half using indices |
| Conquer | Recursively call `mergeSort` on the left half and right half |
| Combine | Merge the two sorted halves back into one sorted result |

## Base Case

The recursion stops when the subarray has size `1`.

> [!note]
> A single element is already sorted, so no further work is needed at that point.

## Merge Sort in Action

Example array:

`[ 8 | 3 | 7 | 1 | 5 | 9 | 2 | 0 ]`

We call `mergeSort(int idx_start, int idx_end)`.

### Recursive Expansion Example

```cpp
mergeSort(0,7):
    mergeSort(0,3);
    mergeSort(4,7);
    merge(0,4,7);

mergeSort(0,3):
    mergeSort(0,1);
    mergeSort(2,3);
    merge(0,2,3);

mergeSort(0,1):
    mergeSort(0,0);
    mergeSort(1,1);
    merge(0,1,1);
```

What this example is showing:

- The full range is repeatedly split into smaller subranges.
- Recursive calls continue until each range has size `1`.
- Once the base case is reached, the algorithm merges sorted pieces back together.

### Other Merge Sort Examples

Additional worked examples are in the lecture slides.

## Discussion

### Pros and Cons

| Pros | Cons |
| ---- | ---- |
| Very good locality | Requires $O(N)$ extra space for arrays |
| Runs in $O(N \log N)$ time | Linked lists take work to find the halfway point |
| Parallel-friendly because the two halves can be processed independently | Although linked lists can be merged without extra space, splitting them is less convenient |

### Key Takeaways

- Merge sort is asymptotically better than the basic $O(N^2)$ sorts from the previous lecture.
- It is a natural fit for parallel execution because the two recursive halves are independent before the merge step.
- Its main tradeoff on arrays is the extra buffer space needed during merging.

# Quicksort

> [!info] Rest In Peace Tony Hoare
> Creator of Quicksort

Idea:
I have a list of small and large items. To sort this:
- Separate the small items and large items in 2 piles (**partitioning**)
- Sort the small items
- Sort the large items
- Combine the lists together

1. How do we decide what's big and what's small??
	- Pick item from the list (**pivot**)
	- Smaller items are small, bigger items are big
2. How do we sort the small/large items?
	- Recursively partition the small/big items into 2 piles. Sort each pile then combine.

## Partitioning

A partition of an array, given pivot $x$, is a rearrangement of the items so that
- All entries to the left of $x$ are $\leq x$
- All entries to the right of $x$ are $\geq x$
- $x$ moves between the smaller and larger items

![[partitioning_for_quicksort.png|634]]

## Quicksort

1. pick a pivot
2. get elements less than pivot on left, greater on right
3. Recursively sort left and right

### Step 1

pick a pivot

Always pick the last element?
- May lead to bad performance...

Good choice: random index
- Suppose I pick index 4 (value = 5)

![[choose_pivot.png|383]]

### Step 2

get elements less than pivot on the left, greater on the right

WE swap pivot into the last spot (put it in an out of the way place)

![[swap_pivot.png|544]]

We track 2 indices:
- lo: scans right for something larger than the pivot
- hi: scans left for something smaller than pivot

![[track_2_indices.png|547]]

When both are stuck, swap `array[lo]` and `array[hi]`

![[swap_lo_hi.png|552]]

Then we increment lo and hi and keep scanning

![[swap_lo_hi_2.png|554]]

Here we can see that `array[lo] = 3` is now smaller than pivot, so we increment `lo` and re-check

![[increment_lo.png|540]]
Now we see that `array[lo] = 7` is >= pivot, which is 5.
So we stop `lo` and start working on `hi`
Right now `array[hi] = 9` which is >= pivot. So we scan left

![[increment_hi.png|546]]

Now that `array[hi] < pivot`, we stop and swap the two numbers

Then we continue to scan

![[keep_scanning.png|540]]

Now they both reach `1`, `lo` keeps scanning right.

![[increment_lo_again.png|543]]

Crossing: when `lo > hi`, the scouts have cross. We swap the pivot (5) with `array[lo]`

But how do we know `lo` is positioned where the pivot belong...?
- Everything to the left of `lo` is definitely smaller than pivot
- Everything to the right of `lo`, including `lo`, is larger than the pivot
- The benefit of keeping invariants in your algorithms

![[swapped_lo_pivot.png|537]]

At this point
- All items smaller than 5 is to the left
- All items bigger than 5 is to the right
- 5 is in correct place
We make 2 recursive quick sort calls
- One for the left and for the right

## Quicksort Performance

Worst case: $O(N^2)$
- Always pick the largest/smallest element
- Will effectively sort 1 element each recursion

Average case: $O(N\log N)$
- Pick elements somewhere near the middle mostly
- Will cut array roughly in half each time

## Pros and Cons

Pros:
- On average, $O(N\log N)$ which is fastest in practice
- Good locality (cache behaviour)
- In place

Cons:
- Can be $O(N^2)$
- REQUIRES EXTRA SPACE FOR RECURSIVE STACKS!!!!!!!!
