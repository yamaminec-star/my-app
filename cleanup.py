import json
import os
import sys
from pathlib import Path

def main():
    # 環境変数から対象フォルダを取得
    target_folders_str = os.environ.get('TARGET_FOLDERS', 'images,uploads')
    target_dirs = [folder.strip() for folder in target_folders_str.split(',')]
    
    total_deleted = 0
    
    # 各対象フォルダをチェック
    for target_dir in target_dirs:
        dir_path = Path(target_dir)
        
        if not dir_path.exists():
            print(f"⚠️  フォルダが見つかりません: {target_dir}")
            continue
        
        # そのフォルダ内のfiles.jsonを読み込み
        json_file = dir_path / 'files.json'
        
        if not json_file.exists():
            print(f"⚠️  {target_dir}/files.json が見つかりません")
            continue
        
        print(f"\n📁 チェック中: {target_dir}")
        
        # JSONから有効なファイルリストを読み込み
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            valid_files = set(data['files'])
        
        print(f"   保持ファイル数: {len(valid_files)}")
        
        files_to_delete = []
        
        # フォルダ内のファイルをチェック（サブフォルダは含めない場合）
        for file_path in dir_path.iterdir():
            if file_path.is_file() and file_path.name != 'files.json':
                if file_path.name not in valid_files:
                    files_to_delete.append(file_path)
                    print(f"   ❌ 削除対象: {file_path.name}")
        
        # 削除実行
        if files_to_delete:
            for f in files_to_delete:
                f.unlink()
            print(f"   🗑️  {len(files_to_delete)} 個のファイルを削除しました")
            total_deleted += len(files_to_delete)
        else:
            print(f"   ✅ 削除対象なし")
    
    print(f"\n{'='*50}")
    print(f"✅ 合計 {total_deleted} 個のファイルを削除しました")
    
    return total_deleted

if __name__ == '__main__':
    main()
