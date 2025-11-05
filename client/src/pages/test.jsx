 <div className="space-y-2">
                            <Label htmlFor="parentCategory">
                                Danh Mục <span className="text-red-500">*</span>
                            </Label>

                            {/* Display Value */}
                            {subMenuCategoryData.parentCategory && (
                                <Card className="w-fit px-2 py-1.5 flex-row items-center gap-2 border-muted-foreground/50">
                                    {
                                        allCategory.find(
                                            (cat) =>
                                                cat._id ===
                                                subMenuCategoryData.parentCategory
                                        )?.name
                                    }
                                    <Button
                                        onClick={handleRemoveCategorySelected}
                                        className="cursor-pointer hover:text-red-400 w-0 h-0 text-foreground"
                                    >
                                        <IoClose />
                                    </Button>
                                </Card>
                            )}

                            {/* Select Category */}
                            <Select
                                value={selectCategoryValue}
                                onValueChange={(value) => {
                                    if (!value) return;
                                    setSubMenuCategoryData((prev) => ({
                                        ...prev,
                                        parentCategory: value,
                                    }));
                                    setSelectCategoryValue('');
                                }}
                                disabled={!!subMenuCategoryData.parentCategory}
                            >
                                <SelectTrigger className="w-full border-muted-foreground/50 border-2">
                                    <SelectValue placeholder="Chọn Danh Mục" />
                                </SelectTrigger>

                                <SelectContent>
                                    {allCategory.map((parentCategory) => (
                                        <SelectItem
                                            key={parentCategory._id}
                                            value={parentCategory._id}
                                            disabled={
                                                parentCategory._id ===
                                                subMenuCategoryData.parentCategory
                                            }
                                        >
                                            {parentCategory.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>